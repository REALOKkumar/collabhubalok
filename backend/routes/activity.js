//The "Recorder" Route (backend/routes/activity.js)
//Note: We usually won't call this manually from the frontend. Instead, we call this inside other backend routes whenever something happens.

// Helper function to be used inside other routes
const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, actionType, description) => {
  try {
    const newLog = new ActivityLog({
      user: userId,
      actionType,
      description
    });
    await newLog.save();
    console.log(`[Activity Logged]: ${description}`);
  } catch (err) {
    console.error("Logging failed:", err);
  }
};

module.exports = { logActivity };
