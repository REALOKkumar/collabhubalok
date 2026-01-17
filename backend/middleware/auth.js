import admin from "../firebase.js";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = await admin.auth().verifyIdToken(token);

    const user = await User.findOne({ firebaseUid: decoded.uid });

    if (!user) {
      return res.status(401).json({ message: "User not found in database" });
    }

    req.user = user; // 🔥 LINKED USER
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export default auth;
