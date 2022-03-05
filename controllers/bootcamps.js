const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const Bootcamp = require('../model/Bootcamp');
const geocoder = require('../utils/geocoder');
// desc     Get all bootcamps
// route    GET /api/v1/bootcamps
// access   Public
const getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// desc     Get single bootcamp
// route    GET /api/v1/bootcamps/:id
// access   Public
const getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id).populate('courses');
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp not found with id of ${req.params.id}`)
    );
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// desc     Create single bootcamp
// route    POST /api/v1/bootcamps/
// access   Private
const createBootcamp = asyncHandler(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  // Check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If the user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(400, `You already published a bootcamp`));
  }
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// desc     update  bootcamp
// route    PUT /api/v1/bootcamps/:id
// access   Private
const updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp not found with id of ${req.params.id}`)
    );
  }
  // Check if the user is owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        'Unauthorized to update this bootcamp,You will only able to update your bootcamp'
      )
    );
  }

  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, data: bootcamp });
});

// desc     Delete a bootcamp
// route    DELETE /api/v1/bootcamps/:id
// access   Private
const deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp not found with id of ${req.params.id}`)
    );
  }

  // Check if the user is owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        'Unauthorized to update this bootcamp,You will only able to delete your bootcamp'
      )
    );
  }

  bootcamp.remove();
  res.status(200).json({ success: true, deletedItem: bootcamp });
});

// desc     Get bootcamps within a radius
// route    GET /api/v1/bootcamps/radius/:zipcode/:distance
// access   Private
const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // Get lang,lat from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Divide distance by radius of Earth
  // earth radius = 3963 mi or 6,378 km
  const radius = distance / 3963;
  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: { $centerSphere: [[lng, lat], radius] },
    },
  });
  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

// desc     Upload Photo for bootcamp
// route    put /api/v1/bootcamps/:id/photo
// access   Private
const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(404, `Bootcamp not found with id of ${req.params.id}`)
    );
  }
  // Check if the user is owner of the bootcamp
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        401,
        'Unauthorized to update this bootcamp,You will only able to update your bootcamp'
      )
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(400, `Please upload a file`));
  }
  const file = req.files.file;
  // Make sure  the file is a image
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(400, `Please upload a image file`));
  }
  // Check filesize
  if (file.size > process.env.MAX_FILE_SIZE) {
    return next(new ErrorResponse(400, `Please upload a image less than 5 MB`));
  }
  // Create custom filename
  file.name = `photo_${bootcamp._id}_${file.name}`;
  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(500, `Problem with uploading file`));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});

module.exports = {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
};
