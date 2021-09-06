import { FieldError } from "../resolvers/FieldError";

export const getErrorFields = (errors: FieldError[]): string[] => {
  if (errors.length > 0) {
    return errors.map((error) => error.field);
  }
  return [];
};
