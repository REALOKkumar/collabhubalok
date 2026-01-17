import express from "express";
import auth from "../middleware/auth.js";

const router = express.Router();

/* PROTECTED DASHBOARD */
router.get("/dashboard", auth, (req, res) => {
  res.json({
    message: "User authorized",
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role
    }
  });
});

export default router;
