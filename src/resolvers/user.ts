import { Session } from "express-session";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { v4 } from "uuid";

import { MyContext } from "../types";
import { User, UserStatuses, UserTypes } from "../entities/User";
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from "../constants";

// import utils
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";

// import type
import { RegisterInput } from "./RegisterInput";
import { FieldError } from "./FieldError";
import { isValidEmail } from "../utils/isValidEmail";
import { isValidUrl } from "../utils/isValidUrl";
import { City } from "../entities/City";

interface ILoginUserSession extends Session {
  userId: number;
}

@InputType()
class LoginInput {
  @Field()
  email: string;
  @Field()
  password: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!(req.session as ILoginUserSession).userId) {
      return null;
    }

    return User.findOne((req.session as ILoginUserSession).userId);
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: RegisterInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors: FieldError[] = validateRegister(options);

    if (errors.length > 0) {
      return {
        errors,
      };
    }

    const hashedPassword = await argon2.hash(options.password);

    let user;
    try {
      user = await User.create({
        name: options.name,
        surname: options.surname,
        email: options.email,
        password: hashedPassword,
        userType: options.userType ?? UserTypes.DEFAULT,
        status: options.status ?? UserStatuses.ACTIVATION_PENDING,
      }).save();
    } catch (err) {
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [{ field: "email", message: "Email already taken" }],
        };
      }
    }

    // autologin user after registration
    (req.session as ILoginUserSession).userId = (user as any).id;

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: LoginInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { email: options.email } });

    if (!user) {
      return {
        errors: [
          {
            field: "email",
            message: "Adresse mail ou mot de passe invalide",
          },
        ],
      };
    }

    const valid = await argon2.verify(user.password, options.password);

    if (!valid) {
      return {
        errors: [
          {
            field: "email",
            message: "Adresse mail ou mot de passe invalide",
          },
        ],
      };
    }

    (req.session as ILoginUserSession).userId = user.id;

    return { user };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext): Promise<Boolean> {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
        res.clearCookie(COOKIE_NAME);
      })
    );
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ): Promise<boolean> {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // the email is not in db
      return true;
    }

    const token: string = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24
    );

    await sendEmail(
      email,
      "Password reset",
      `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
    );

    return true;
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Arg("newPasswordConfirm") newPasswordConfirm: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    const errors: FieldError[] = [];

    if (newPassword.length < 8) {
      errors.push({
        field: "newPassword",
        message: "Password must have at least 8 characters",
      });
    }

    if (newPassword !== newPasswordConfirm) {
      errors.push({
        field: "newPassword",
        message: "Both password must be the same",
      });
    }

    if (errors.length > 0) {
      return { errors };
    }

    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token);

    if (!userId) {
      return {
        errors: [{ field: "token", message: "token expired" }],
      };
    }

    const parsedUserId = parseInt(userId);
    const user = await User.findOne(parsedUserId);

    if (!user) {
      return {
        errors: [{ field: "token", message: "user doesn't exists" }],
      };
    }

    await User.update(
      { id: parsedUserId },
      { password: await argon2.hash(newPassword) }
    );

    await redis.del(key);

    (req.session as ILoginUserSession).userId = user.id;

    return { user };
  }

  @Mutation(() => UserResponse, { nullable: true })
  async updateUser(
    @Arg("id") id: number,
    @Arg("email", { nullable: true }) email: string,
    @Arg("name", { nullable: true }) name: string,
    @Arg("surname", { nullable: true }) surname: string,
    @Arg("description", { nullable: true }) description: string,
    @Arg("website", { nullable: true }) website: string,
    @Arg("cityId", { nullable: true }) cityId: number,
    @Arg("userType", { nullable: true }) userType: UserTypes,
    @Arg("status", { nullable: true }) status: UserStatuses
  ): Promise<UserResponse> {
    const user = await User.findOne(id, { relations: ["city"] });
    if (!user) {
      return {
        errors: [{ field: "id", message: "L'utilisateur n'existe pas" }],
      };
    }
    const errors: FieldError[] = [];

    if (typeof email !== "undefined") {
      if (isValidEmail(email)) {
        user.email = email;
      } else {
        errors.push({
          field: "email",
          message: "L'adresse mail est invalide",
        });
      }
    }

    if (typeof name !== "undefined") {
      let validField = true;
      if (name.length <= 2) {
        errors.push({
          field: "name",
          message: "Le prénom doit comporter au moins 2 caractères",
        });
        validField = false;
      }

      if (name.length >= 26) {
        errors.push({
          field: "name",
          message: "Le prénom doit comporter moins de 26 caractères",
        });
        validField = false;
      }

      if (validField) {
        user.name = name;
      }
    }

    if (typeof surname !== "undefined") {
      let validField = true;
      if (surname.length <= 2) {
        errors.push({
          field: "surname",
          message: "Le prénom doit comporter au moins 2 caractères",
        });
        validField = false;
      }

      if (surname.length >= 26) {
        errors.push({
          field: "surname",
          message: "Le prénom doit comporter moins de 26 caractères",
        });
        validField = false;
      }

      if (validField) {
        user.surname = surname;
      }
    }

    if (typeof description !== "undefined") {
      if (description.length > 500) {
        errors.push({
          field: "description",
          message: "La description doit comporter 500 caractères maximum",
        });
      } else {
        user.description = description;
      }
    }

    if (typeof website !== "undefined") {
      if (isValidUrl(website)) {
        user.website = website;
      } else {
        errors.push({
          field: "website",
          message: "Le format du site web est invalide",
        });
      }
    }

    if (typeof cityId !== "undefined") {
      const city = await City.findOne(cityId);
      if (city) {
        user.city = city;
      }
    }

    if (typeof userType !== "undefined") {
      if (Object.values(UserTypes).includes(userType)) {
        user.userType = userType;
      } else {
        errors.push({
          field: "userType",
          message: "Ce type d'utilisateur n'existe pas",
        });
      }
    }

    if (typeof status !== "undefined") {
      if (Object.values(UserStatuses).includes(status)) {
        user.status = status;
      } else {
        errors.push({
          field: "status",
          message: "Ce statut n'existe pas",
        });
      }
    }

    User.update({ id }, { ...user });
    return { errors, user };
  }
}
