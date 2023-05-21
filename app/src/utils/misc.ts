export const bytesToString = (bytes: number[]): string => {
  return Buffer.from(bytes)
    .filter(x => x)
    .toString();
};

export const round = (num: number, digits: number): number => {
  return Math.round(num * 10 ** digits) / 10 ** digits;
};
