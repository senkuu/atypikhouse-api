import { Criteria } from "../entities/Criteria";
import { Field, ObjectType } from "type-graphql";
import { FieldError } from "../resolvers/FieldError";

@ObjectType()
export class CriteriasListResponse {
  @Field(() => [FieldError])
  errors: FieldError[];

  @Field(() => [Criteria])
  criterias: Criteria[];
}

export const generateCriteriasList = async (
  criteriaIds: number[]
): Promise<CriteriasListResponse> => {
  let response: CriteriasListResponse = { errors: [], criterias: [] };

  for (const index in criteriaIds) {
    const id = criteriaIds[index];

    let criteria = await Criteria.findOne(id);
    if (typeof criteria !== "undefined") {
      response.criterias.push(criteria);
    } else {
      response.errors.push({
        field: "criteriaIds",
        message: `Le critère ${id} est introuvable`,
      });
    }
  }

  return response;
};

export const removeCriteriasFromList = (
  criterias: Criteria[],
  criteriaIds: number[]
): CriteriasListResponse => {
  let response: CriteriasListResponse = {
    errors: [],
    criterias: criterias,
  };

  criteriaIds.forEach((id) => {
    let criteriaIndex = response.criterias.findIndex(
      (criteria) => criteria.id == id
    );
    if (criteriaIndex === -1) {
      response.errors.push({
        field: "criteriaIds",
        message: `Le critère ${id} est introuvable`,
      });
    }
    if (criteriaIndex > -1) {
      response.criterias.splice(criteriaIndex, 1);
    }
  });

  return response;
};

export const addCriteriasInList = async (
  criterias: Criteria[],
  criteriaIds: number[]
): Promise<CriteriasListResponse> => {
  let response: CriteriasListResponse = {
    errors: [],
    criterias: criterias,
  };

  for (const index in criteriaIds) {
    const id = criteriaIds[index];
    let criteria = await Criteria.findOne(id);

    if (!criteria) {
      response.errors.push({
        field: "criteriaIds",
        message: `Le critère ${id} est introuvable`,
      });
    } else if (criterias.find((criteria) => criteria.id === id)) {
      response.errors.push({
        field: "criteriaIds",
        message: `Le critère ${id} (${criteria.name}) est déjà présent dans la liste`,
      });
    } else {
      await response.criterias.push(criteria);
    }
  }

  return response;
};
