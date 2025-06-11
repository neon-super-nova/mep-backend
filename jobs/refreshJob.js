import nodeCron from "node-cron";

const startRefreshJob = () => {
  // schedule refresh for midnight everyday
  // 0 0  * * * (means 0 seconds 0 minutes)
  nodeCron.schedule("0 0 * * *", async () => {
    try {
      console.log("refreshed trending recipe cache at 00:00");
    } catch (err) {
      console.log("error refresing trending recipe cache");
    }
  });
};
