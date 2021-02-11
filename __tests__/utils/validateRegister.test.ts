import { validateRegister } from "../../src/utils/validateRegister";

describe("validateRegister function", () => {
  it("should return an empty array when all entries are valid", () => {
    const validUser = {
      email: "valid@email.com",
      username: "validUsername",
      password: "validPassword",
    };

    const errors = validateRegister(validUser);

    expect(errors).toStrictEqual([]);
  });

  it("should return an error when email isn't valid", () => {
    const invalidUser = {
      email: "invalidEmail",
      username: "validUsername",
      password: "validPassword",
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "email",
        message: "This email is not valid",
      },
    ]);
  });

  it("should return an error when username had less than 2 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      username: "a",
      password: "validPassword",
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "username",
        message: "Username must have at least 2 characters",
      },
    ]);
  });

  it("should return an error when username had more than 2 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      username:
        "invalidUsernameinvalidUsernameinvalidUsernameinvalidUsernameinvalidUsernameinvalidUsername",
      password: "validPassword",
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "username",
        message: "Username must be lesser than 26",
      },
    ]);
  });

  it("should return an error when password had less than 8 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      username: "validUsername",
      password: "invalid",
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "password",
        message: "Password must have at least 8 characters",
      },
    ]);
  });

  it("should return multiple errors when there are many errors at the same time", () => {
    const invalidUser = {
      email: "invalid",
      username: "a",
      password: "invalid",
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "email",
        message: "This email is not valid",
      },
      {
        field: "username",
        message: "Username must have at least 2 characters",
      },
      {
        field: "password",
        message: "Password must have at least 8 characters",
      },
    ]);
  });
});
