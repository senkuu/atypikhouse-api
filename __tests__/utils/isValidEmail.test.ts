import { isValidEmail } from "../../src/utils/isValidEmail";

describe("isValidEmail function", () => {
  it("should return true when email is valid", () => {
    const validEmail = "valid@email.com";

    expect(isValidEmail(validEmail)).toBe(true);
  });

  it("should return false when email is not valid", () => {
    expect(isValidEmail("invalid@mail")).toBe(false);
    expect(isValidEmail("invalidmail")).toBe(false);
    expect(isValidEmail("invalidmail,fr")).toBe(false);
    expect(isValidEmail("invalid@.mail")).toBe(false);
  });
});
