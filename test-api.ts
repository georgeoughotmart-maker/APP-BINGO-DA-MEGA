import express from "express";
const app = express();
app.use(express.json());
app.post("/api/login", (req, res) => {
  res.json({ message: "API is working", received: req.body });
});
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong" });
});
app.listen(3000, "0.0.0.0", () => {
  console.log("Test server running on port 3000");
});
