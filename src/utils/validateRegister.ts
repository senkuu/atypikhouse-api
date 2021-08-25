import { isValidEmail } from "./isValidEmail";
import { RegisterInput } from "../resolvers/RegisterInput";
import { FieldError } from "../resolvers/FieldError";

export const validateRegister = (options: RegisterInput): FieldError[] => {
  const errors: FieldError[] = [];

  if (!isValidEmail(options.email)) {
    errors.push({
      field: "email",
      message: "Cette adresse mail est invalide",
    });
  }

  if (options.name.length <= 2) {
    errors.push({
      field: "name",
      message: "Le prénom doit comporter au moins 2 caractères",
    });
  }

  if (options.name.length >= 26) {
    errors.push({
      field: "name",
      message: "Le prénom doit comporter moins de 26 caractères",
    });
  }

  if (options.surname.length <= 2) {
    errors.push({
      field: "surname",
      message: "Le nom de famille doit comporter au moins 2 caractères",
    });
  }

  if (options.surname.length >= 26) {
    errors.push({
      field: "surname",
      message: "Le nom de famille doit comporter moins de 26 caractères",
    });
  }

  if (options.password.length < 8) {
    errors.push({
      field: "password",
      message: "Le mot de passe doit comporter au moins 8 caractères",
    });
  }

  //TODO: En attente d'intégration
  /*if (!/[0-9]/.test(options.password) || !/[A-Z]/.test(options.password)) {
    errors.push({
      field: "password",
      message:
        "Le mot de passe doit co mporter au moins 1 chiffre et 1 majuscule",
    });
  }*/

  return errors;
};
