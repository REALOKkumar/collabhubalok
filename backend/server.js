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

// ... (Previous imports)
const interactionsRoute = require('./routes/interactions');

// ... (Middleware)

// Use the routes
app.use('/api/interactions', interactionsRoute); 
// Now you can fetch: 
// http://localhost:5000/api/interactions/messages
// http://localhost:5000/api/interactions/join-request