const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
  try {
    const { username, password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }

    // Create new user
    const user = new User({
      username,
      password,
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, 
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }


    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, 
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getUserRankings = async (req, res) => {
  try {
    const users = await User.find()
      .select("username wins losses")
      .sort([
        ["wins", -1], 
        ["losses", 1], 
        ["username", 1], 
      ]);

    
    const rankedUsers = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      wins: user.wins,
      losses: user.losses,
      winRate:
        user.wins + user.losses > 0
          ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(2)
          : "0.00",
    }));

    res.json(rankedUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
