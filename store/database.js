import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
const mongoClient = new MongoClient(uri);

let db;

export const connectDatabase = async () => {
  try {
    await mongoClient.connect();
    db = mongoClient.db();
    console.log("Connected to mongo db");
  } catch (err) {
    console.log("Connection failed, try again");
    process.exit(1);
  }
};

export const getDatabase = async () => {
  if (!db) {
    throw new Error("Database not found");
  } else {
    return db;
  }
};
