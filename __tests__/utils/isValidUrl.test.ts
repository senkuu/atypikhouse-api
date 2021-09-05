import { isValidUrl } from "../../src/utils/isValidUrl";

describe("isValidUrl function", () => {
  it("should return true if url is valid", () => {
    expect(isValidUrl("https://www.website.com")).toBe(true);
    expect(isValidUrl("http://www.website.com")).toBe(true);
    expect(isValidUrl("www.website.com")).toBe(true);
    expect(isValidUrl("website.com")).toBe(true);
    expect(isValidUrl("123.com")).toBe(true);
    expect(
      isValidUrl("www.website.com/random-page-name-1662622?parameter=value")
    ).toBe(true);
    expect(
      isValidUrl("http://www.website.com/random-page-name-1662622#parameter")
    ).toBe(true);
  });

  it("should return false if url is not valid", () => {
    expect(isValidUrl("website")).toBe(false);
    expect(isValidUrl("123")).toBe(false);
    expect(isValidUrl("email@website.com")).toBe(false);
    expect(isValidUrl("invalid§website.com")).toBe(false);
    expect(isValidUrl(".website")).toBe(false);
    expect(isValidUrl("website^com")).toBe(false);
  });
});
