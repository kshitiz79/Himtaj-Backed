const express = require('express');

const User = require('./user.model');
const generateToken = require('../middleware/generateToken');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

const OTP = require('./otp.model');

const crypto = require("crypto");
const { sendEmail } = require("./../../utils/emailService"); // Import email service

// register

router.post('/register', async (req, res) => {
  try{
    const { email, password, username } = req.body;
    const user = new User({ email, password, username });
    await user.save();

    res.status(201).send({ message: "User registered successfully" });
  }
  catch(error){
    console.error('Error registering user:', error);
        res.status(500).send({ message: 'Registration failed' });
  }

})

//login


router.post("/send-otp", async (req, res) => {
  try {
      const { email } = req.body;
      const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
      await OTP.create({ email, otp, expiresAt: Date.now() + 10 * 60 * 1000 });
      await sendEmail(email, "Your OTP", `Your OTP is ${otp}`);
      res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to send OTP" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
      const { email, otp } = req.body;
      const otpRecord = await OTP.findOne({ email, otp });
      if (!otpRecord || otpRecord.expiresAt < Date.now()) {
          return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      
      await OTP.deleteOne({ _id: otpRecord._id });
      res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to verify OTP" });
  }
});


router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find the OTP in the database
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord || otpRecord.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Remove OTP record after verification
    await OTP.deleteOne({ _id: otpRecord._id });

    // Proceed with registration or other logic
    res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
});



router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }); 
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).send({ message: 'Invalid credentials' });
    }

    const token = await generateToken(user._id); 

    res.cookie('token', token, {
      httpOnly: true,
      secure: true, // for HTTPS
      sameSite: 'None'
    });

    res.status(200).send({
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
        profession: user.profession,
      }
    });

  } catch (err) {
    console.error('Error logged in user:', err); // ✅ corrected
    res.status(500).send({ message: 'Login failed', error: err.message });
  }
});

//logoutendpoint

router.post('/logout', (req, res) => {
  res.clearCookie('token'); 
  res.status(200).send({ message: 'Logged out successfully' });
});

router.delete('/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const user = await User.findByIdAndDelete(id);
      if (!user) {
          return res.status(404).send({ message: 'User not found' });
      }
      res.status(200).send({ message: 'User deleted successfully' });
  } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send({ message: 'Failed to delete user' });
  }
}
)


router.get('/users', async (req, res) => {
  try {
      const users = await User.find({}, 'id email role').sort({ createdAt: -1 });
      res.status(200).send(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send({ message: 'Failed to fetch users' });
  }
});


// update a user role
router.put('/users/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const { role } = req.body;
      const user = await User.findByIdAndUpdate(id, { role }, { new: true });
      if (!user) {
          return res.status(404).send({ message: 'User not found' });
      }
      res.status(200).send({ message: 'User role updated successfully', user });
  } catch (error) {
      console.error('Error updating user role:', error);
      res.status(500).send({ message: 'Failed to update user role' });
  }
});

router.patch('/edit-profile', async (req, res) => {
  try {
      // Destructure fields from the request body
      const { userId, username, profileImage, bio, profession } = req.body;

      // Check if userId is provided
      if (!userId) {
          return res.status(400).send({ message: 'User ID is required' });
      }

      // Find user by ID
      const user = await User.findById(userId);
      if (!user) {
          return res.status(404).send({ message: 'User not found' });
      }

      // Update the user's profile with provided fields
      if (username !== undefined) user.username = username;
      if (profileImage !== undefined) user.profileImage = profileImage;
      if (bio !== undefined) user.bio = bio;
      if (profession !== undefined) user.profession = profession;

      // Save the updated user profile
      await user.save();

      // Send the updated user profile as the response
      res.status(200).send({
          message: 'Profile updated successfully',
          user: {
              _id: user._id,
              username: user.username,
              email: user.email,
              profileImage: user.profileImage,
              bio: user.bio,
              profession: user.profession,
              role: user.role,
          }
      });
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).send({ message: 'Profile update failed' });
  }
});

module.exports = router;
