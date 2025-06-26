import { getDatabase, connectDatabase } from "../store/database.js";

const recipeDescription = async () => {
  await connectDatabase();
  const db = getDatabase();
  const recipeCollection = db.collection("recipes");

  await recipeCollection.updateMany(
    { description: { $exists: false } },
    {
      $set: {
        description: "add description here",
      },
    }
  );

  console.log("Recipe description added successfully.");
  process.exit(0);
};

recipeDescription().catch((err) => {
  console.log(err);
  process.exit(1);
});
