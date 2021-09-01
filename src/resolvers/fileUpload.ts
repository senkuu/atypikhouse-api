import { Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import path from "path";
import { generateRandomString } from "../utils/generateRandomString";
import fs from "fs";

@ObjectType()
class File {
  @Field()
  url: string;
}

@Resolver()
export class FileUploadResolver {
  @Query()
  hello(): string {
    return "Hello world";
  }

  @Mutation(() => File)
  async uploadFile(parent, { file }): Promise<File> {
    const { createReadStream, filename } = await file;

    const { ext } = path.parse(filename);
    const randomName = generateRandomString(32) + ext;

    const stream = createReadStream();
    const pathName = path.join(__dirname, `/public/images/${randomName}`);
    await stream.pipe(fs.createWriteStream(pathName));

    return {
      url: `http://localhost:4000/images/${randomName}`,
    };
  }
}
