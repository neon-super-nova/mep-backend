import { getDatabase } from "../database.js";

const db = getDatabase();

export const autoIncrement = async (counter) => {
  const id = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: counter },
      { $inc: { seq: 1 } },
      { upsert: true, returnDocument: "after" }
    );
  return counter.value.seq;
};
