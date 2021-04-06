import "reflect-metadata";

require("dotenv").config();

import express from "express";
import session from "express-session";
import cors from "cors";
import { ApolloServer } from "apollo-server-express";

import Redis from "ioredis";
import connectRedis from "connect-redis";

import { createConnection } from "typeorm";
import { Offer } from "./entities/Offer";
import { User } from "./entities/User";

import { buildSchema } from "type-graphql";
import { HelloResolvers } from "./resolvers/hello";
import { OfferResolver } from "./resolvers/offer";
import { UserResolver } from "./resolvers/user";

import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types";

const main = async () => {
  await createConnection({
    type: "postgres",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [Offer, User],
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redis = new Redis(
    parseInt(process.env.REDIS_PORT!),
    process.env.REDIS_HOST
  );

  app.use(
    cors({
      origin: process.env.WEB_URL ?? "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({
        client: redis,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 ans (pour test)
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // only works in https
      },
      saveUninitialized: false,
      secret: "ekip",
      resave: false,
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolvers, OfferResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ req, res, redis }),
  });

  apolloServer.applyMiddleware({
    app,
    cors: false,
  });

  app.listen(4000, () => {
    console.log(`server started on localhost:4000`);
  });
};

main();