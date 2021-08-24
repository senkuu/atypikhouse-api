import { FieldError } from "../resolvers/FieldError";

export const validateOfferType = (
  name: string,
  criteriaIds: number[]
): FieldError[] => {
  const errors: FieldError[] = [];

  // A voir si utile
  if (typeof name === "undefined") {
    errors.push({
      field: "name",
      message: "Name is not defined",
    });
  }

  if (name.length > 64) {
    errors.push({
      field: "name",
      message: "Name is limited to 64 characters",
    });
  }

  // A voir si utile
  /*if (typeof criteriaIds !== "undefined" && criteriaIds.length === 0) {
    errors.push({
      field: "criteriaIds",
      message: "An error occurred retrieving criteria ids",
    });
  }*/

  return errors;
};
