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

  process.exit(0);
};

userDeleted().catch((err) => {
  process.exit(1);
});
