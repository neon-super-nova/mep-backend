import { getDatabase, connectDatabase } from "../store/database.js";

const backfillLikeCounts = async () => {
  await connectDatabase();
  const db = getDatabase();
  const likesCollection = db.collection("likes");
  const recipeStatsCollection = db.collection("recipeStats");

  const likes = await likesCollection
    .aggregate([{ $group: { _id: "$recipeId", likeCount: { $sum: 1 } } }])
    .toArray();

  for (const like of likes) {
    await recipeStatsCollection.updateOne(
      { recipeId: like._id },
      { $set: { likeCount: like.likeCount } },
      { upsert: true }
    );
  }
  process.exit(0);
};

backfillLikeCounts().catch((err) => {
  console.error("Error backfilling like counts:", err);
  process.exit(1);
});
