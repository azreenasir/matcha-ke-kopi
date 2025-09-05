import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  choice: {
    type: String,
    enum: ["matcha", "kopi"], // only allow 2 choices
    required: true,
  },
  ipAddress: {
    type: String, // to prevent multiple votes from same IP
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
