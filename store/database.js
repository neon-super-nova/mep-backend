import dotenv from "dotenv";
import mongoose from "mongoose";

const MongoClient = mongoose.mongo.MongoClient;
dotenv.config();
let db = null;
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

export const connectDatabase = async () => {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);
  } catch (err) {
    console.log("Database connection failed", err);
    throw err;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error("Database not initialized");
  }
  return db;
};
