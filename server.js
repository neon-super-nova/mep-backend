import express from "express";
import dotenv from "dotenv";
import { connectDatabase } from "./store/database.js";
import { userStore } from "./store/users/userStore.js";
import { userResource } from "./resource/users/userResource.js";
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

connectDatabase()
  .then(async () => {
    await userStore.init();
    app.use("/api/users", userResource.router);

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
