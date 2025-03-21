import express from "express";
const app = express();
const port = 8080;

app.get("/", (req, res) => {
  app.send("Server working");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
