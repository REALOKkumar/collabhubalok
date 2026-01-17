const router = require('express').Router();
const Post = require('../models/Post'); // Ensure you have a Post model
const User = require('../models/User');

// POST /api/posts/create
router.post('/create', async (req, res) => {
  const { title, desc, firebaseUid } = req.body;

  try {
    // Optional: Verify user exists in MongoDB first
    const user = await User.findOne({ firebaseUid });
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Create the post linked to the User
    // Assuming your Post model has a 'user' field that references the User ID or stores firebaseUid
    const newPost = new Post({
      user: user._id, // Linking to MongoDB _id (Best Practice)
      title,
      description: desc,
    });

    await newPost.save();
    res.json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// GET /api/posts
// Description: Get all posts sorted by newest first
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // Sort by newest first
      .populate('user', 'name email'); // <--- THE MAGIC LINE
      // .populate() tells Mongo: "Go to the User collection, find the user with this ID, 
      // and replace the ID here with their actual 'name' and 'email'."

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;