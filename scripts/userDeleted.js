import { connectDatabase, getDatabase } from "../store/database.js";

const userDeleted = async () => {
  await connectDatabase();
  const db = getDatabase();
  const userCollection = db.collection("users");

  const update = await userCollection.updateMany(
    { deleted: { $exists: false } },
    {
      $set: {
        deleted: false,
      },
    }
  );

  console.log("Added deleted: false to user collection successfully");
  process.exit(0);
};

userDeleted().catch((err) => {
  console.log("error adding deleted: false to user collection");
  process.exit(1);
});
