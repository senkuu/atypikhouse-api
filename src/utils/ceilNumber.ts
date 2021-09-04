export const ceilNumber = (number: number, decimals: number): number | null => {
  if (!Number.isInteger(decimals) || decimals > 5) {
    return null;
  }

  const factor = Math.pow(10, decimals);

  if (number === Math.trunc(number * factor) / factor) {
    return number;
  }

  return Math.ceil(number * factor) / factor;
};
