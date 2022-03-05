const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Course = require('../model/Course');
const Bootcamp = require('../model/Bootcamp');

// desc     Get all courses
// route    GET /api/v1/courses
// route    GET /api/v1/bootcamps/:bootcampId/courses
// access   Public

const getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single course
// @route     GET /api/v1/courses/:id
// @access    Public

const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  if (!course) {
    return next(
      new ErrorResponse(404, `No course found with the id of ${req.params.id}`)
    );
  }
  res.status(200).json({ success: true, data: course });
});
// @desc      Add course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    Private

const addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  // Add user to the req.body
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(
        404,
        `No bootcamp found with the id of ${req.params.bootcampId}`
      )
    );
  }
  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        `You are not the owner of the bootcamp of: ${req.params.bootcampId}`
      )
    );
  }
  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});

// @desc      Update course
// @route     PUT /api/v1/courses/:id
// @access    Private
const updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(404, `No course found with the id or ${req.params.id}`)
    );
  }

  // Check if the user is owner of the course
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        'Unauthorized to update this course,You will only able to update your courses'
      )
    );
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: course });
});
// @desc      Delete course
// @route     DELETE /api/v1/courses/:id
// @access    Private

const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(404, `No courses found with the id of ${req.params.id}`)
    );
  }

  // Check if the user is owner of the bootcamp
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        'Unauthorized to delete this course,You will only able to delete your courses'
      )
    );
  }
  const deletedCourse = await course.remove();
  res.status(200).json({
    success: true,
    msg: 'Successfully deleted the bellow item',
    data: deletedCourse,
  });
});
module.exports = {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
};
