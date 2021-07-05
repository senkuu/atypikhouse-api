import { validateRegister } from "../../src/utils/validateRegister";
import {UserTypes} from "../../src/entities/User";

describe("validateRegister function", () => {
  it("should return an empty array when all entries are valid", () => {
    const validUser = {
      email: "valid@email.com",
      name: "John",
      surname: "Doe",
      password: "validPassword",
      userType: UserTypes.DEFAULT
    };

    const errors = validateRegister(validUser);

    expect(errors).toStrictEqual([]);
  });

  it("should return an error when email isn't valid", () => {
    const invalidUser = {
      email: "invalidEmail",
      name: "John",
      surname: "Doe",
      password: "validPassword",
      userType: UserTypes.DEFAULT
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "email",
        message: "This email is not valid",
      },
    ]);
  });

  it("should return an error when surname had less than 2 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      name: "John",
      surname: "D",
      password: "validPassword",
      userType: UserTypes.DEFAULT
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "surname",
        message: "Surname must have at least 2 characters",
      },
    ]);
  });

  it("should return an error when username had more than 26 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      name: "John",
      surname:
        "InvalidSurnameInvalidSurnameInvalidSurnameInvalidSurnameInvalidSurnameInvalidSurnameInvalidSurnameInvalidSurname",
      password: "validPassword",
      userType: UserTypes.DEFAULT
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "surname",
        message: "Surname must be lesser than 26",
      },
    ]);
  });

  it("should return an error when name had less than 2 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      name: "J",
      surname: "Doe",
      password: "validPassword",
      userType: UserTypes.DEFAULT
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "name",
        message: "Name must have at least 2 characters",
      },
    ]);
  });

  it("should return an error when username had more than 26 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      name:
        "invalidUsernameinvalidUsernameinvalidUsernameinvalidUsernameinvalidUsernameinvalidUsername",
      surname: "Doe",
      password: "validPassword",
      userType: UserTypes.DEFAULT
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "name",
        message: "Name must be lesser than 26",
      },
    ]);
  });

  it("should return an error when password had less than 8 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      name: "John",
      surname: "Doe",
      password: "invalid",
      userType: UserTypes.DEFAULT
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "password",
        message: "Password must have at least 8 characters",
      },
    ]);
  });

  it("should return an error when user type isn't valid", () => {
    const invalidUser = {
      email: "valid@email.com",
      name: "John",
      surname: "Doe",
      password: "validPassword",
      userType: "InvalidType" as UserTypes
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "userType",
        message: "User type is not valid",
      },
    ]);
  });

  it("should return multiple errors when there are many errors at the same time", () => {
    const invalidUser = {
      email: "invalid",
      name: "J",
      surname: "Doe",
      password: "invalid",
      userType: UserTypes.DEFAULT
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "email",
        message: "This email is not valid",
      },
      {
        field: "name",
        message: "Name must have at least 2 characters",
      },
      {
        field: "password",
        message: "Password must have at least 8 characters",
      },
    ]);
  });
});
