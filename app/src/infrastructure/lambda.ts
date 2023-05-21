import web3, { Connection } from '@solana/web3.js';
import * as anchor from '@project-serum/anchor';
import 'dotenv/config';
import type { ScheduledEvent } from 'aws-lambda';
import NodeWallet from '@project-serum/anchor/dist/esm/nodewallet';
import { TidesClient } from '../TidesClient';
import {
    getAllUsersData,
    getMarkets,
    getUserPositionsWithPda,
} from '$src/rpc/data';
import {
    OptionSide,
    type Market,
    type MarketSideData,
    type Position,
} from '$src/types';
import { getAllFundingData, healthPercent } from '$src/utils/positions';
import type { MarketFunding } from '$src/stores/funding';
import { getOptionSideFromData } from '$src/utils/markets';
import {
    TimestreamWriteClient, WriteRecordsCommand,
} from '@aws-sdk/client-timestream-write';
import { getPythProgramKeyForCluster, PythHttpClient } from '@pythnetwork/client'
import { bytesToString } from '$src/utils/misc';

export type NetworkAndEndpoint = {
    endpoint: string;
    network: 'devnet' | 'mainnet-beta';
};

export const networks: NetworkAndEndpoint[] = [
    {
        endpoint: 'https://solitary-light-pond.solana-devnet.quiknode.pro/8b519031fe8ed437593cc604fe76e5adb66e119c/',
        network: 'devnet',
    },
    {
        endpoint: 'https://polished-little-thunder.solana-mainnet.quiknode.pro/',
        network: 'mainnet-beta'
    },
];

export async function marketUpdateHandler(event: ScheduledEvent) {
    try {
        await (async () => {
            const serviceKey = Uint8Array.from(
                JSON.parse(process.env.MARKET_UPDATE_PKEY),
            );
            const keypair = web3.Keypair.fromSecretKey(serviceKey);
            const wallet = new NodeWallet(keypair);

            const timestreamClient = new TimestreamWriteClient({
                region: 'us-east-1',
                apiVersion: 'latest',
            });

            // eslint-disable-next-line no-constant-condition
            while (true) {
                for (const network of networks) {
                    try {
                        const connection = new Connection(network.endpoint, 'confirmed');
                        const provider = new anchor.AnchorProvider(connection, wallet, {
                            commitment: 'confirmed',
                        });

                        const tidesClient = new TidesClient(provider, {
                            network: network.network,
                            api: true,
                        });

                        const pythClient = new PythHttpClient(connection, getPythProgramKeyForCluster(network.network));
                        const pythData = await pythClient.getData();

                        const [markets] = await getMarkets(tidesClient.program);
                        const marketsArray = (markets.markets as Market[]).filter(
                            m => m.initialized && !m.marketPaused,
                        );

                        for (const market of marketsArray) {

                            const pythMarketIndex = pythData.products.findIndex(x => x.price_account === market.oraclePriceFeed.toBase58())
                            const pythPrice = pythData.productPrice.get(pythData.products[pythMarketIndex].symbol)

                            try {
                                if (!market.marketPaused) {
                                    await tidesClient.marketStatsUpdate(market.index);
                                    console.log(
                                        '>>>> Successful Market Update: Index [',
                                        market.index,
                                        '] in [',
                                        network.network,
                                        '] via the [',
                                        network.endpoint,
                                        '] endpoint.',
                                    );
                                }

                                try {
                                    await timestreamUpdate(
                                        timestreamClient,
                                        tidesClient,
                                        market,
                                        network,
                                        pythPrice.price
                                    );

                                    console.log('>>>> Successful Timestream Update');
                                } catch (e) {
                                    console.log('>>>> Failed Timestream Update');
                                    console.log(e);
                                }
                            } catch (e) {
                                console.log(
                                    '>>>> Failed Market Update: Index [',
                                    market.index,
                                    '] in [',
                                    network.network,
                                    '] via the [',
                                    network.endpoint,
                                    '] endpoint.',
                                );
                                console.log(e);
                            }
                        }
                    } catch (e) {
                        console.log(
                            '>>>> Failed Network Update: for [',
                            network.network,
                            '] network via [',
                            network.endpoint,
                            '] endpoint.',
                        );
                        console.log(e);
                    }
                }

                await delay(5000)
            }

            return;
        })();
    } catch (e) {
        console.log(e);
    }
}

async function timestreamUpdate(
    timestreamClient: TimestreamWriteClient,
    tidesClient: TidesClient,
    market: Market,
    network: NetworkAndEndpoint,
    pythPrice: number
) {
    const DATABASE_NAME = 'Tides';
    const TABLE_NAME = 'Markets';

    console.log('Writing records');
    const currentTime = Date.now().toString(); // Unix time in milliseconds

    const dimensions = [
        {
            Name: 'market_index',
            Value: market.index.toString(),
        },
        {
            Name: 'price_feed',
            Value: market.oraclePriceFeed.toBase58(),
        },
        {
            Name: 'quote_symbol',
            Value: bytesToString(market.symbolQuote) || 'NONE',
        },
        {
            Name: 'network',
            Value: network.network,
        },
    ];

    const commonAttributes = {
        Dimensions: dimensions,
        MeasureValueType: 'DOUBLE',
        Time: currentTime.toString(),
    };

    const price = {
        MeasureName: 'price',
        MeasureValue: pythPrice.toString(),
    };

    const strike = {
        MeasureName: 'strike',
        MeasureValue: market.emaNumeratorSum
            .div(market.emaDenominatorSum)
            .toNumber()
            .toString(),
    };

    const callVolatility = {
        MeasureName: 'call_volatility',
        MeasureValue: (market.callMarketData as MarketSideData).markVolatility.toString(),
    };

    const putVolatility = {
        MeasureName: 'put_volatility',
        MeasureValue: (market.putMarketData as MarketSideData).markVolatility.toString(),
    };

    const callData = market.callMarketData as MarketSideData;
    const putData = market.putMarketData as MarketSideData;

    const callMark = {
        MeasureName: 'call_mark',
        MeasureValue: callData.markPrice.toNumber().toString(),
    };

    const putMark = {
        MeasureName: 'put_mark',
        MeasureValue: putData.markPrice.toNumber().toString(),
    };

    const callFunding = {
        MeasureName: 'call_funding',
        MeasureValue: callData.fundingRate.toNumber().toString(),
    };

    const putFunding = {
        MeasureName: 'put_funding',
        MeasureValue: putData.fundingRate.toNumber().toString(),
    };

    const records = [price, strike, callMark, putMark, callFunding, putFunding, callVolatility, putVolatility];

    const params = {
        DatabaseName: DATABASE_NAME,
        TableName: TABLE_NAME,
        Records: records,
        CommonAttributes: commonAttributes,
    };

    const command = new WriteRecordsCommand(params);

    return await timestreamClient.send(command);
}

export async function liquidationBotHandler(event: ScheduledEvent) {
    try {
        await (async () => {
            const serviceKey = Uint8Array.from(
                JSON.parse(process.env.MARKET_UPDATE_PKEY),
            );
            const keypair = web3.Keypair.fromSecretKey(serviceKey);
            const wallet = new NodeWallet(keypair);

            for (const network of networks) {
                try {
                    const connection = new Connection(network.endpoint, 'confirmed');
                    const provider = new anchor.AnchorProvider(connection, wallet, {
                        commitment: 'confirmed',
                    });

                    const tidesClient = new TidesClient(provider, {
                        network: network.network,
                        api: true,
                    });

                    const [marketsData] = await getMarkets(tidesClient.program);
                    const markets = marketsData.markets as Market[];
                    const funding: MarketFunding[] = await getAllFundingData(
                        tidesClient.program,
                        markets,
                    );

                    // get all users
                    const usersWrapped = await getAllUsersData(tidesClient.program);

                    // iterate users
                    for (const userObj of usersWrapped) {
                        // get user positions
                        const [userPositionData] = await getUserPositionsWithPda(
                            tidesClient.program,
                            userObj.account.positions,
                        );

                        // filter active positions
                        const positionsArray = (
                            userPositionData.positions as Position[]
                        ).filter(p => p.active);

                        // iterate positions
                        for (const position of positionsArray) {
                            const positionHealthPercent = healthPercent(
                                position,
                                markets,
                                funding,
                            );

                            if (positionHealthPercent < 20) {
                                const market = markets[position.marketIndex];

                                const side = getOptionSideFromData(position.side);
                                const marketSideData =
                                    side === OptionSide.Call
                                        ? market.callMarketData
                                        : market.putMarketData;

                                const markPrice = (
                                    marketSideData as MarketSideData
                                ).markPrice.toNumber();

                                const quoteAmount = Math.abs(
                                    position?.quoteAssetAmount.toNumber() || 0,
                                );
                                const baseAmount =
                                    (quoteAmount * markPrice) / 10 ** market.collateralDecimals;

                                const orderQuoteAmount =
                                    position?.quoteAssetAmount.toNumber() > 0
                                        ? -quoteAmount
                                        : quoteAmount;

                                await tidesClient.positionLiquidate(
                                    userObj.account.user,
                                    0,
                                    side,
                                    orderQuoteAmount,
                                    baseAmount,
                                );
                            }
                        }
                    }
                } catch (e) {
                    console.log(e);
                }
            }

            return;
        })();
    } catch (e) {
        console.log(e);
    }
}

const delay = ms => new Promise(res => setTimeout(res, ms));
