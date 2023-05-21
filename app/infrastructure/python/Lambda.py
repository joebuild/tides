import os
import logging
import json
import boto3
import awswrangler
import math
from math import exp, sqrt
import random
import statistics
import numpy as np
import pandas as pd

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb = boto3.resource('dynamodb')
optionPricingTable = dynamodb.Table('OptionPricing')
priceVolatilityTable = dynamodb.Table('PriceVolatility')

MINUTES_IN_A_DAY = 60 * 24

def get_price_query(price_feed, market_index, network):
    PRICE_QUERY_MINUTE = f"""
        SELECT 
            bin(time, 60s) AS binned_timestamp,
            avg(measure_value::double) as price
        FROM Tides.Markets
        WHERE measure_name = 'price' AND price_feed = '{price_feed}' AND market_index = '{market_index}' AND network = '{network}'
        GROUP BY bin(time, 60s)
        ORDER BY binned_timestamp DESC
        LIMIT 7200
    """
    return PRICE_QUERY_MINUTE

# TODO: add filter on 'market_index' (0 for SOL) and 'network' (devnet/mainnet)
LATEST_PRICE = f"""
    SELECT 
      max_by(measure_value::double, time) as price
    FROM Tides.Markets
    WHERE measure_name = 'price' 
    LIMIT 1
"""

# TODO: add filter on 'market_index' (0 for SOL) and 'network' (devnet/mainnet)
LATEST_STRIKE = f"""
    SELECT 
      max_by(measure_value::double, time) as strike
    FROM Tides.Markets
    WHERE measure_name = 'strike' 
    LIMIT 1
"""

ALL_MARKETS = f"""
    SELECT DISTINCT price_feed, network, market_index
    FROM Tides.Markets
"""

DECIMAL_SHIFT = 1000000

def option_pricing_handler(event, context):
    payload = event['Records'][0]['body']
    data = json.loads(str(payload))

    price = data['Price']
    strike = data['Strike']
    volatility = data['Volatility']

    pricing = get_pricing(strike, volatility)

    n = 202

    if pricing != None and pd.notna(pricing['n']) and int(pricing['n']) >= n:
        print(pricing)
    else:
        optionsPrices = everlasting_options_price_vec(price, strike, volatility/(1000 * 100), 14, 500, n, True)
        update_pricing(strike, volatility, optionsPrices['call'], optionsPrices['put'], n)

    return {
        'statusCode': 200
    }


def price_volatility_handler(event, context):

    print('calculating price volatility for all markets..')

    marketsDf = awswrangler.timestream.query(ALL_MARKETS)

    for index, row in marketsDf.iterrows():
        priceFeed = row['price_feed']
        marketIndex = row['market_index']
        network = row['network']

        if pd.notna(priceFeed):
            df = awswrangler.timestream.query(get_price_query(priceFeed, marketIndex, network))
            volatility = get_volatility(df)
            update_volatility(priceFeed, marketIndex, network, volatility)
            print(f"updated volatility [{volatility}] for price_feed [{priceFeed}], marketIndex [{marketIndex}], network [{network}]")

    return {
        'statusCode': 200
    }

####
# using vectors to optimize, about 5x faster

def v_asian_sample_vec(start_price, start_strike, volatility, m, floating_strike):
    r = 0.0
    X = np.random.normal((r-volatility**2/2), volatility, m)

    PArray = np.exp(np.cumsum(X))
    P = np.mean(PArray)*start_price

    strike = start_strike

    if floating_strike:
        buffer = pd.DataFrame(np.full(m * 2, start_strike), columns = ['price'])
        price_array = pd.DataFrame(PArray * start_price, columns = ['price'])

        ewaDf = pd.concat([buffer, price_array]).ewm(halflife=1440, adjust=True)
        ewa = ewaDf.mean()['price'].iat[-1]
        # ewa = ewaDf.mean()['price'].mean()
        strike = ewa

    # print(np.mean(np.exp(np.cumsum(X)))*start_price)
    # print('\n')

    return {
        'call': math.exp(-r*m)*max(P - strike, 0),
        'put': math.exp(-r*m)*max(strike - P, 0)
    }

def v_asian(start_price, start_strike, volatility, m, n, floating_strike):
    results = [v_asian_sample_vec(start_price, start_strike, volatility, m, floating_strike) for i in range(n)]
    return {
        'call': statistics.mean([results[i]['call'] for i in range(n)]),
        'put': statistics.mean([results[i]['put'] for i in range(n)])
    }

def everlasting_options_price_vec(latest_price, latest_strike, volatility, funding_interval_min, num_funding_intervals, num_sims_, floating_strike):
    call_numerator_sum = 0
    put_numerator_sum = 0

    denominator_sum = 0

    index = 1

    funding_intervals_per_day = round(MINUTES_IN_A_DAY / funding_interval_min)
    subsequent_weight_scale = (funding_intervals_per_day - 1) / funding_intervals_per_day

    adjusted_weight_scale = 1.0

    num_sims = num_sims_

    while index <= num_funding_intervals & num_sims > 0:
        expiry_min = index * funding_interval_min

        option_prices = v_asian(latest_price, latest_strike, volatility, expiry_min, num_sims, floating_strike)

        call_numerator_sum += option_prices['call']*adjusted_weight_scale
        put_numerator_sum += option_prices['put']*adjusted_weight_scale

        denominator_sum += adjusted_weight_scale

        num_sims = round(num_sims * subsequent_weight_scale) # to save time we can just scale down the number of simulations as the weight becomes less important
        index += 1
        adjusted_weight_scale *= subsequent_weight_scale

    return {'call': call_numerator_sum/denominator_sum, 'put': put_numerator_sum/denominator_sum}


def get_volatility(df):
    df['price'] = df['price'].div(DECIMAL_SHIFT)
    df['price_ratio'] = df['price'] / df['price'].shift(1)
    df['price_ratio_ln'] = np.log2(df['price_ratio'])
    df['ln_minus_mean'] = df['price_ratio_ln'] - df['price_ratio_ln'].mean()
    df['square'] = df['ln_minus_mean']**2

    volatility = sqrt(df['square'].mean())

    return volatility


def update_volatility(price_feed, market_index, network, volatility):
    UpdateExpression = 'SET market_index = :market_index, network = :network, volatility = :volatility'
    ExpressionAttributeValues = {
            ':market_index': str(market_index),
            ':network': str(network),
            ':volatility': str(volatility)
        }

    update = priceVolatilityTable.update_item(
        Key={
            'PriceFeedAccount': price_feed,
        },
        UpdateExpression=UpdateExpression,
        ExpressionAttributeValues=ExpressionAttributeValues
    )


def get_pricing(strike, volatility):
    response = optionPricingTable.get_item(
        Key={
            'Strike': strike,
            'Volatility': volatility
        }
    )

    if 'Item' in response.keys():
        return response['Item']
    else:
        return None


def update_pricing(strike, volatility, call, put, n):
    UpdateExpression = 'SET call_price = :call_price, put_price = :put_price, n = :n'
    ExpressionAttributeValues = {
            ':call_price': str(call),
            ':put_price': str(put),
            ':n': str(n),
        }

    update = optionPricingTable.update_item(
        Key={
            'Strike': strike,
            'Volatility': volatility
        },
        UpdateExpression=UpdateExpression,
        ExpressionAttributeValues=ExpressionAttributeValues
    )


# '''
# Parameters:
# s0 = initial stock price
# k = strike price
# r = risk-less short rate
# sig = volatility of stock value
# m = time to maturity (min)
# n = the number of simulation
# '''

# '''
# trial:
# print(asian_option_mc(5200, 5200, 0.03, 1, 0.25, 100, 20000))
# '''

# # i think this can be parallelized
# def asian_option_mc(s0, k, r, sig, m, n, floating_strike):
#     # It is an arithmetic solution by using Monte Carlo method
#     c = []
#     p = []
#     for i in range(0, n):
#         s = [s0]
#         for j in range(0, m):
#             s.append(s[-1] * exp((r - 0.5 * sig ** 2) + (sig * random.gauss(0, 1))))

#         buffer = pd.DataFrame(np.full(len(s) * 2, k), columns = ['price'])
#         price_array = pd.DataFrame(s, columns = ['price'])

#         strike = k

#         if floating_strike:
#             ewaDf = pd.concat([buffer, price_array]).ewm(halflife=1440, adjust=True)
#             ewa = ewaDf.mean()['price'].iat[-1]
#             strike = ewa

#         avg = np.mean(s)
#         c.append(max((avg - strike), 0))
#         p.append(max((strike - avg), 0))

#     c_value = np.mean(c) * exp(-r * m)
#     c_standard_error = np.std(c) / np.sqrt(n)

#     p_value = np.mean(p) * exp(-r * m)
#     p_standard_error = np.std(p) / np.sqrt(n)

#     return {'call': c_value, 'standard error(c)': c_standard_error, 'put': p_value, 'standard error(p)': p_standard_error}

# def everlasting_options_price(latest_price, latest_strike, volatility, funding_interval_min, num_funding_intervals, num_sims_, floating_strike):
#     call_numerator_sum = 0
#     put_numerator_sum = 0

#     denominator_sum = 0

#     index = 1

#     funding_intervals_per_day = round(MINUTES_IN_A_DAY / funding_interval_min)
#     subsequent_weight_scale = (funding_intervals_per_day - 1) / funding_intervals_per_day

#     adjusted_weight_scale = 1.0

#     num_sims = num_sims_

#     while index <= num_funding_intervals & num_sims > 0:
#         expiry_min = index * funding_interval_min

#         option_prices = asian_option_mc(latest_price, latest_strike, 0.0, volatility, expiry_min, num_sims, floating_strike)

#         call_numerator_sum += option_prices['call']*adjusted_weight_scale
#         put_numerator_sum += option_prices['put']*adjusted_weight_scale

#         denominator_sum += adjusted_weight_scale

#         num_sims = round(num_sims * subsequent_weight_scale) # to save time we can just scale down the number of simulations as the weight becomes less important
#         index += 1
#         adjusted_weight_scale *= subsequent_weight_scale

#     return {'call': call_numerator_sum/denominator_sum, 'put': put_numerator_sum/denominator_sum}
