import { ceilNumber } from "../../src/utils/ceilNumber";

describe("ceilNumber function", () => {
  it("should return null if decimals are incorrect", () => {
    expect(ceilNumber(9, 1.5)).toBeNull();
    expect(ceilNumber(9, -1.5)).toBeNull();
    expect(ceilNumber(9, 6)).toBeNull();
  });

  it("should return the same number if it has as much or less decimals as decimals parameter", () => {
    expect(ceilNumber(9, 2)).toBe(9);
    expect(ceilNumber(9.4, 2)).toBe(9.4);
    expect(ceilNumber(9.47, 2)).toBe(9.47);
    expect(ceilNumber(9, 1)).toBe(9);
    expect(ceilNumber(9.4, 1)).toBe(9.4);
    expect(ceilNumber(-9, 2)).toBe(-9);
    expect(ceilNumber(-9.4, 2)).toBe(-9.4);
    expect(ceilNumber(-9.47, 2)).toBe(-9.47);
    expect(ceilNumber(-9, 1)).toBe(-9);
    expect(ceilNumber(-9.4, 1)).toBe(-9.4);
  });

  it("should return rounded up number based on decimals parameter if it has more decimals than it", () => {
    expect(ceilNumber(9, 0)).toBe(9);
    expect(ceilNumber(9.4, 0)).toBe(10);
    expect(ceilNumber(9.47, 0)).toBe(10);
    expect(ceilNumber(16.341, 2)).toBe(16.35);
    expect(ceilNumber(81.9878458415, 2)).toBe(81.99);
    expect(ceilNumber(-9, 0)).toBe(-9);
    expect(ceilNumber(-9.4, 0)).toBe(-9);
    expect(ceilNumber(-9.47, 0)).toBe(-9);
    expect(ceilNumber(-16.341, 2)).toBe(-16.34);
    expect(ceilNumber(-81.9878458415, 2)).toBe(-81.98);
  });
});
