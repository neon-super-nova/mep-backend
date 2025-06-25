import nodeCron from "node-cron";
import { topRatedRecipeStore } from "../store/dashboard-recipes/topRatedRecipeStore.js";
import { trendingRecipeStore } from "../store/dashboard-recipes/trendingRecipeStore.js";

const startRefreshJob = () => {
  // schedule refresh for midnight everyday
  // 0 0  * * * (means 0 seconds 0 minutes)
  nodeCron.schedule("0 0 * * *", async () => {
    try {
      console.log("Starting trending recipe cache refresh at midnight...");
      // Make sure store is initialized
      if (!topRatedRecipeStore.collection) {
        topRatedRecipeStore.init();
      }
      if (!trendingRecipeStore.collection) {
        trendingRecipeStore.init();
      }
      // Refresh cache
      topRatedRecipeStore.refreshTopRatedRecipeCache();
      console.log("Top rated recipe cache refreshed successfully.");
      trendingRecipeStore.refreshTrendingRecipeCache();
      console.log("Trending recipe cache refreshed successfully.");
    } catch (err) {
      console.error("Error refreshing trending recipe cache:", err);
    }
  });
};

export default startRefreshJob;
