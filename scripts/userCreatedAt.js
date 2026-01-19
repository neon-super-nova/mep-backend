import { getDatabase, connectDatabase } from "../store/database.js";

const userCreatedAt = async () => {
  await connectDatabase();
  const db = getDatabase();
  const userCollection = db.collection("users");

  await userCollection.updateMany(
    { createdAt: { $exists: false } },
    {
      $set: {
        createdAt: new Date(),
      },
    }
  );

  process.exit(0);
};

userCreatedAt().catch((err) => {
  process.exit(1);
});
