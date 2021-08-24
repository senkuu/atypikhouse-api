import { GraphQLScalarType, Kind } from "graphql";

// TODO: Récupéré à partir d'un thread StackOverflow non fonctionnel, à voir comment exploiter : https://stackoverflow.com/questions/68012501/how-can-i-use-the-point-type-coordinate-information-of-postgis-in-graphql-using
export const GeoJSONPoint = new GraphQLScalarType({
  name: "GeoJSONPoint",
  description: "Geometry scalar type",
  parseValue(value) {
    console.log("parseValue : " + value);
    return value;
  },

  serialize(value) {
    console.log("serialize : " + value);
    return value;
  },

  parseLiteral(ast) {
    console.log("parseLiteral : " + ast);
    if (ast.kind === Kind.OBJECT) {
      console.log("ICI" + ast);
      return new Object(ast);
    }
    return null;
  },
});
