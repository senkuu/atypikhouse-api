import { FieldError } from "../resolvers/FieldError";
import { getErrorFields } from "./getErrorFields";
import { extraProperties } from "./createEntity";

// Entity needs to be saved outside of this function after calling it
export const updateEntity = <Type>(
  entity: Type,
  options: any,
  errors: FieldError[],
  ignoredFieldsInput?: string[],
  extraPropertiesInput?: extraProperties
): Type => {
  let errorFields = getErrorFields(errors);

  const ignoredFields: string[] = ignoredFieldsInput ?? [];
  const extraProperties: extraProperties = extraPropertiesInput ?? {};

  for (const [field, value] of Object.entries(options)) {
    if (!ignoredFields.includes(field) && !errorFields.includes(field)) {
      // @ts-ignore
      entity[field] = value;
    }
  }

  for (const field in extraProperties) {
    if (!errorFields.includes(field)) {
      // @ts-ignore
      entity[field] = extraProperties[field];
    }
  }

  return entity;
};
