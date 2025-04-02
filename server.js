import express from "express";
import dotenv from "dotenv";
import { connectDatabase } from "./store/database.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(express.json());

connectDatabase().then(() => {
  app.get("/", (req, res) => {
    app.send("Server working");
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
});
