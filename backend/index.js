import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Vote from "./models/Vote.js";

dotenv.config(); // load .env variables

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// Use environment variable
const uri = process.env.MONGO_URI;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ connected"))
  .catch((err) => console.error("❌ connection error:", err));

// // Routes
// app.get("/results", async (req, res) => {
//   try {
//     const matchaVotes = await Vote.countDocuments({ choice: "matcha" });
//     const kopiVotes = await Vote.countDocuments({ choice: "kopi" });
//     res.json({ matchaVotes, kopiVotes, total: matchaVotes + kopiVotes });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// Cast a vote
app.post("/vote", async (req, res) => {
  const { choice } = req.body;

  let ipAddress =
    req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;

  if (!ipAddress) {
    ipAddress = "unknown";
  } else if (ipAddress === "::1" || ipAddress === "127.0.0.1") {
    ipAddress = "localhost"; // treat all local as same voter
  }

  console.log("📌 Choice:", choice);
  console.log("📌 IP Address:", ipAddress);

  try {
    // Check if IP already voted
    const existingVote = await Vote.findOne({ ipAddress });
    if (existingVote) {
      return res.status(400).json({ message: "❌ You already voted!" });
    }

    // Save new vote
    const vote = new Vote({ choice, ipAddress });
    await vote.save();

    res.json({ message: "✅ Vote counted!", vote });
  } catch (err) {
    console.error("❌ Vote error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/results", async (req, res) => {
  try {
    const matchaVotes = await Vote.countDocuments({ choice: "matcha" });
    const kopiVotes = await Vote.countDocuments({ choice: "kopi" });
    const total = matchaVotes + kopiVotes;

    res.json({ matchaVotes, kopiVotes, total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
