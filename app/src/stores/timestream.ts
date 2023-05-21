import { writable } from 'svelte/store';
import {
  QueryCommand,
  type TimestreamQueryClient,
} from '@aws-sdk/client-timestream-query';
import type {
  CandlestickData,
  SingleValueData,
  UTCTimestamp,
} from 'lightweight-charts';
import type { Network } from './network';

const offset = new Date().getTimezoneOffset() * 60 - 24 * 60 * 60;

export type Candle = {
  time: number;
  open: number;
  close: number;
  low: number;
  high: number;
};

export const strikePrices = writable([] as SingleValueData[]);

export const oraclePrices = writable([] as CandlestickData[]);
export const callPrices = writable([] as CandlestickData[]);
export const putPrices = writable([] as CandlestickData[]);

export const setOraclePrices = async (
  quoteSymbol: string,
  network: Network,
  timestreamClient: TimestreamQueryClient,
  latestOraclePrice = 0,
) => {
  const queryCommand = getCandleQuery(quoteSymbol, network, 'price');
  const response = await timestreamClient.send(queryCommand);

  const candles: CandlestickData[] = response.Rows.map(r => {
    const data = r.Data;
    return {
      time: (Date.parse(data[0].ScalarValue) / 1000 + offset) as UTCTimestamp,
      open: Number(data[1].ScalarValue),
      close: Number(data[2].ScalarValue),
      low: Number(data[3].ScalarValue),
      high: Number(data[4].ScalarValue),
    };
  }).sort((a, b) => (a.time > b.time ? 1 : -1));

  if (latestOraclePrice > 0 && candles[candles.length - 1]) {
    candles[candles.length - 1].close = latestOraclePrice;
  }

  oraclePrices.set(candles);
};

export const setCallPrices = async (
  quoteSymbol: string,
  network: Network,
  timestreamClient: TimestreamQueryClient,
  latestCallPrice = 0,
) => {
  const queryCommand = getCandleQuery(quoteSymbol, network, 'call_mark');
  const response = await timestreamClient.send(queryCommand);

  const candles: CandlestickData[] = response.Rows.map(r => {
    const data = r.Data;
    return {
      time: (Date.parse(data[0].ScalarValue) / 1000 + offset) as UTCTimestamp,
      open: Number(data[1].ScalarValue) / 10 ** 6,
      close: Number(data[2].ScalarValue) / 10 ** 6,
      low: Number(data[3].ScalarValue) / 10 ** 6,
      high: Number(data[4].ScalarValue) / 10 ** 6,
    };
  }).sort((a, b) => (a.time > b.time ? 1 : -1));

  if (latestCallPrice > 0 && candles[candles.length - 1]) {
    candles[candles.length - 1].close = latestCallPrice;
  }

  callPrices.set(candles);
};

export const setPutPrices = async (
  quoteSymbol: string,
  network: Network,
  timestreamClient: TimestreamQueryClient,
  latestPutPrice = 0,
) => {
  const queryCommand = getCandleQuery(quoteSymbol, network, 'put_mark');
  const response = await timestreamClient.send(queryCommand);

  const candles: CandlestickData[] = response.Rows.map(r => {
    const data = r.Data;
    return {
      time: (Date.parse(data[0].ScalarValue) / 1000 + offset) as UTCTimestamp,
      open: Number(data[1].ScalarValue) / 10 ** 6,
      close: Number(data[2].ScalarValue) / 10 ** 6,
      low: Number(data[3].ScalarValue) / 10 ** 6,
      high: Number(data[4].ScalarValue) / 10 ** 6,
    };
  }).sort((a, b) => (a.time > b.time ? 1 : -1));

  if (latestPutPrice > 0 && candles[candles.length - 1]) {
    candles[candles.length - 1].close = latestPutPrice;
  }

  putPrices.set(candles);
};

export const setStrikePrices = async (
  quoteSymbol: string,
  network: Network,
  timestreamClient: TimestreamQueryClient,
) => {
  const queryCommand = getLineQuery(quoteSymbol, network, 'strike');
  const response = await timestreamClient.send(queryCommand);
  const values: SingleValueData[] = response.Rows.map(r => {
    const data = r.Data;
    return {
      time: (Date.parse(data[0].ScalarValue) / 1000 + offset) as UTCTimestamp,
      value: Number(data[1].ScalarValue) / 10 ** 6,
    };
  }).sort((a, b) => (a.time > b.time ? 1 : -1));

  strikePrices.set(values);
};

export const getCandleQuery = (
  quoteSymbol: string,
  network: Network,
  param: string,
  binSizeSec = 864,
): QueryCommand => {
  const query = `
    SELECT 
      bin(time, ${binSizeSec}s) AS binned_timestamp,
      min_by(measure_value::double, time) as open,
      max_by(measure_value::double, time) as close,
      min(measure_value::double) as low,
      max(measure_value::double) as high
    FROM Tides.Markets
    WHERE measure_name = '${param}' AND quote_symbol = '${quoteSymbol}' AND network = '${network}'
    GROUP BY bin(time, ${binSizeSec}s)
    ORDER BY binned_timestamp DESC
    LIMIT 1000
  `;
  return new QueryCommand({ QueryString: query });
};

export const getLineQuery = (quoteSymbol: string, network: Network, param: string, binSizeSec = 864): QueryCommand => {
  const query = `
    SELECT 
      bin(time, ${binSizeSec}s) AS binned_timestamp,
      avg(measure_value::double) as price
    FROM Tides.Markets
    WHERE measure_name = '${param}' AND quote_symbol = '${quoteSymbol}' AND network = '${network}'
    GROUP BY bin(time, ${binSizeSec}s)
    ORDER BY binned_timestamp DESC
    LIMIT 1000
  `;
  return new QueryCommand({ QueryString: query });
};
