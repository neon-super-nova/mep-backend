import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import passport from "passport";
import helmet from "helmet";
import { connectDatabase } from "./store/database.js";
import { userStore } from "./store/users/userStore.js";
import { userInfoStore } from "./store/user-info/userInfoStore.js";
import { forgotPasswordStore } from "./store/forgotPassword/forgotPasswordStore.js";
import { recipeStore } from "./store/recipes/recipeStore.js";
import { reviewStore } from "./store/reviews/reviewStore.js";
import { likeStore } from "./store/likes/likeStore.js";
import { trendingRecipeStore } from "./store/trending-recipes/trendingRecipeStore.js";

import { userResource } from "./resource/users/userResource.js";
import { recipeResource } from "./resource/recipes/recipeResource.js";
import { configureGooglePassport } from "./config/oauth/oauth.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
configureGooglePassport();
app.use(passport.initialize());

app.use(helmet());

connectDatabase()
  .then(async () => {
    await userStore.init();
    await userInfoStore.init();
    await forgotPasswordStore.init();
    await recipeStore.init();
    await likeStore.init();
    await reviewStore.init();
    // await trendingRecipeStore.init();

    await app.use("/api/users", userResource.router);
    await app.use("/api/recipes", recipeResource.router);

    app.get("/", (req, res) => {
      res.send("Server is working");
    });

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.log("Database connection failed", error);
    process.exit(1);
  });
