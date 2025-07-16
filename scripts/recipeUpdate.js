import { getDatabase, connectDatabase } from "../store/database.js";

const recipeUpdate = async () => {
  await connectDatabase();
  const db = getDatabase();
  const recipeCollection = db.collection("recipes");

  const result = await recipeCollection.updateMany(
    { imageUrl: { $type: "string" } },
    { $unset: { imageUrl: "" } }
  );

  console.log("Deleted field in", result.modifiedCount, "documents");
  process.exit(0);
};

recipeUpdate().catch((err) => {
  console.log(err);
  process.exit(1);
});
