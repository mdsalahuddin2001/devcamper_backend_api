const express = require('express');
const {
  getBootcamps,
  createBootcamp,
  getBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require('../controllers/bootcamps');
const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');
const Bootcamp = require('../model/Bootcamp');
const router = express.Router();

const coursesRouter = require('./courses');
router.use('/:bootcampId/courses', coursesRouter);

router
  .route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher','admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher','admin'), updateBootcamp)
  .delete(protect, authorize('publisher','admin'), deleteBootcamp);
router.route('/:id/photo').put(protect, authorize('publisher','admin'), bootcampPhotoUpload);
router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

module.exports = router;
