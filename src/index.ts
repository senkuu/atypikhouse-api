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
import { Booking } from "./entities/Booking";
import { Criteria } from "./entities/Criteria";
import { OfferType } from "./entities/OfferType";

import { buildSchema } from "type-graphql";
import { HelloResolvers } from "./resolvers/hello";
import { OfferResolver } from "./resolvers/offer";
import { UserResolver } from "./resolvers/user";

import { COOKIE_NAME, __prod__ } from "./constants";
import { MyContext } from "./types";
import { BookingResolver } from "./resolvers/booking";
import { CriteriaResolver } from "./resolvers/criteria";
import { OfferTypeResolver } from "./resolvers/offerType";
import { OfferCriteria } from "./entities/OfferCriteria";
import { City } from "./entities/City";
import { Departement } from "./entities/Departement";
import { Region } from "./entities/Region";
import { CityResolver } from "./resolvers/city";
import { RegionResolver } from "./resolvers/region";
import { DepartementResolver } from "./resolvers/departement";
import { Review } from "./entities/Review";
import { Photo } from "./entities/Photo";
import { PhotoType } from "./entities/PhotoType";
import { Planning } from "./entities/Planning";
import { NoticeType } from "./entities/NoticeType";
import { Notice } from "./entities/Notice";

const main = async () => {
  await createConnection({
    type: "postgres",
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: true,
    synchronize: true,
    entities: [
      Offer,
      User,
      Booking,
      Criteria,
      OfferType,
      OfferCriteria,
      City,
      Departement,
      Region,
      Review,
      Photo,
      PhotoType,
      Planning,
      Notice,
      NoticeType,
    ],
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
      resolvers: [
        HelloResolvers,
        OfferResolver,
        UserResolver,
        BookingResolver,
        CriteriaResolver,
        OfferTypeResolver,
        CityResolver,
        RegionResolver,
        DepartementResolver,
      ],
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
