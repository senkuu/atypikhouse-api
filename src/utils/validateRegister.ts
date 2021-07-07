import { isValidEmail } from "./isValidEmail";
import { RegisterInput } from "../resolvers/RegisterInput";
import { FieldError } from "../resolvers/FieldError";
import { UserTypes } from "../entities/User";

export const validateRegister = (options: RegisterInput): FieldError[] => {
  const errors: FieldError[] = [];

  if (!isValidEmail(options.email)) {
    errors.push({
      field: "email",
      message: "This email is not valid",
    });
  }

  if (options.name.length <= 2) {
    errors.push({
      field: "name",
      message: "Name must have at least 2 characters",
    });
  }

  if (options.name.length >= 26) {
    errors.push({
      field: "name",
      message: "Name must be lesser than 26",
    });
  }

  if (options.surname.length <= 2) {
    errors.push({
      field: "surname",
      message: "Surname must have at least 2 characters",
    });
  }

  if (options.surname.length >= 26) {
    errors.push({
      field: "surname",
      message: "Surname must be lesser than 26",
    });
  }

  if (options.password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must have at least 8 characters",
    });
  }

  if (typeof options.userType !== "undefined") {
    if (!Object.values(UserTypes).includes(options.userType)) {
      errors.push({
        field: "userType",
        message: "User type is not valid",
      });
    }
  }

  return errors;
};
