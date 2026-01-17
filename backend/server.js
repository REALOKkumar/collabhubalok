import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

dotenv.config();

const app = express();

/* MIDDLEWARE */
app.use(cors());
app.use(express.json());

/* DATABASE */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

/* ROUTES */
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

/* HEALTH CHECK */
app.get("/", (req, res) => {
  res.send("Backend running");
});

/* SERVER */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);

const express = require('express');
const cors = require('cors'); // Import CORS


app.use(cors()); // <--- Enable CORS for all routes
app.use(express.json());

// ... rest of your routes ...