import { FieldError } from "../../src/resolvers/FieldError";
import { getErrorFields } from "../../src/utils/getErrorFields";

describe("getErrorFields function", () => {
  it("should return an empty array if there are no errors in the base array", () => {
    const emptyErrorsArray: FieldError[] = [];
    const fields = getErrorFields(emptyErrorsArray);
    expect(fields).toStrictEqual([]);
  });

  it("should return an array with field properties of each error in the array", () => {
    const validErrorsArray: FieldError[] = [
      {
        field: "a",
        message: "Lorem ipsum dolor sit amet",
      },
      {
        field: "b",
        message: "Lorem ipsum dolor sit amet",
      },
      {
        field: "c",
        message: "Lorem ipsum dolor sit amet",
      },
      {
        field: "d",
        message: "Lorem ipsum dolor sit amet",
      },
      {
        field: "e",
        message: "Lorem ipsum dolor sit amet",
      },
      {
        field: "f",
        message: "Lorem ipsum dolor sit amet",
      },
    ];

    const fields = getErrorFields(validErrorsArray);

    expect(fields).toStrictEqual(["a", "b", "c", "d", "e", "f"]);
  });
});
