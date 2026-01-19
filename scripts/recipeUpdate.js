import { getDatabase, connectDatabase } from "../store/database.js";

const recipeUpdate = async () => {
  await connectDatabase();
  const db = getDatabase();
  const recipeCollection = db.collection("recipes");

  const result = await recipeCollection.updateMany(
    { imageUrl: { $type: "string" } },
    { $unset: { imageUrl: "" } }
  );

  process.exit(0);
};

recipeUpdate().catch((err) => {
  process.exit(1);
});
