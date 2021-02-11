import { isValidEmail } from "./isValidEmail";
import { RegisterInput } from "../resolvers/RegisterInput";
import { FieldError } from "../resolvers/FieldError";

export const validateRegister = (options: RegisterInput): FieldError[] => {
  const errors: FieldError[] = [];

  if (!isValidEmail(options.email)) {
    errors.push({
      field: "email",
      message: "This email is not valid",
    });
  }

  if (options.username.length <= 2) {
    errors.push({
      field: "username",
      message: "Username must have at least 2 characters",
    });
  }

  if (options.username.length >= 26) {
    errors.push({
      field: "username",
      message: "Username must be lesser than 26",
    });
  }

  if (options.password.length < 8) {
    errors.push({
      field: "password",
      message: "Password must have at least 8 characters",
    });
  }

  return errors;
};
