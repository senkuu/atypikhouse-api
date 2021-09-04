import { DeepPartial, getConnection, Repository } from "typeorm";

// key : field name in entity / value : value to insert
export interface extraProperties {
  [key: string]: any;
}

export const createEntity = async <Type>(
  options: any,
  repositoryName: string,
  ignoredFieldsInput?: string[],
  extraPropertiesInput?: extraProperties
): Promise<Type> => {
  const repository: Repository<Type> = getConnection().getRepository(
    repositoryName
  );

  const ignoredFields: string[] = ignoredFieldsInput ?? [];
  const extraProperties: extraProperties = extraPropertiesInput ?? {};

  const propertiesInput: DeepPartial<Type> = {};

  for (const [field, value] of Object.entries(options)) {
    if (!ignoredFields.includes(field)) {
      // @ts-ignore
      propertiesInput[field] = value;
    }
  }

  for (const index in extraProperties) {
    // @ts-ignore
    propertiesInput[index] = extraProperties[index];
  }

  // @ts-ignore
  return await repository.create(propertiesInput).save();
};
