const express = require('express');
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  resetPassword,
  updatedetails,
  updatePassword,
  logoutUser,
} = require('../controllers/auth');

const { protect } = require('../middleware/auth');

const router = express.Router();

// mixed router.route() & router.method() for practice
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.get('/logout', logoutUser);
router.route('/me').get(protect, getMe);
router.put('/updatedetails', updatedetails);
router.put('/updatepassword', updatePassword);
router.route('/forgotpassword').post(forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

module.exports = router;
