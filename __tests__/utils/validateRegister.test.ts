import { validateRegister } from "../../src/utils/validations/validateRegister";
import { UserTypes } from "../../src/entities/User";

describe("validateRegister function", () => {
  it("should return an empty array when all entries are valid", () => {
    const validUser = {
      email: "valid@email.com",
      name: "John",
      surname: "Doe",
      password: "validPassword",
      userType: UserTypes.DEFAULT,
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
      userType: UserTypes.DEFAULT,
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "email",
        message: "Cette adresse mail est invalide",
      },
    ]);
  });

  it("should return an error when surname had less than 2 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      name: "John",
      surname: "D",
      password: "validPassword",
      userType: UserTypes.DEFAULT,
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "surname",
        message: "Le nom de famille doit comporter au moins 2 caractères",
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
      userType: UserTypes.DEFAULT,
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "surname",
        message: "Le nom de famille doit comporter moins de 26 caractères",
      },
    ]);
  });

  it("should return an error when name had less than 2 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      name: "J",
      surname: "Doe",
      password: "validPassword",
      userType: UserTypes.DEFAULT,
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "name",
        message: "Le prénom doit comporter au moins 2 caractères",
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
      userType: UserTypes.DEFAULT,
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "name",
        message: "Le prénom doit comporter moins de 26 caractères",
      },
    ]);
  });

  it("should return an error when password had less than 8 characters", () => {
    const invalidUser = {
      email: "valid@email.com",
      name: "John",
      surname: "Doe",
      password: "invalid",
      userType: UserTypes.DEFAULT,
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "password",
        message: "Le mot de passe doit comporter au moins 8 caractères",
      },
    ]);
  });

  it("should return multiple errors when there are many errors at the same time", () => {
    const invalidUser = {
      email: "invalid",
      name: "J",
      surname: "Doe",
      password: "invalid",
      userType: UserTypes.DEFAULT,
    };

    const errors = validateRegister(invalidUser);

    expect(errors).toStrictEqual([
      {
        field: "email",
        message: "Cette adresse mail est invalide",
      },
      {
        field: "name",
        message: "Le prénom doit comporter au moins 2 caractères",
      },
      {
        field: "password",
        message: "Le mot de passe doit comporter au moins 8 caractères",
      },
    ]);
  });
});
