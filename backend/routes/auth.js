const router = require('express').Router();
const User = require('../models/User');

// Route: POST /api/auth/sync
// Description: Receives user data from frontend and saves to MongoDB
router.post('/sync', async (req, res) => {
  const { firebaseUid, email, username } = req.body;

  try {
    // 1. Check if user already exists in MongoDB
    let user = await User.findOne({ firebaseUid });

    if (!user) {
      // 2. If not, create a new user in MongoDB
      user = new User({
        firebaseUid,
        email,
        username: username || email.split('@')[0] // Default username if none provided
      });
      await user.save();
      return res.status(201).json({ msg: "User created in MongoDB", user });
    }

    // 3. If user exists, just return the user data
    res.status(200).json({ msg: "User found", user });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;