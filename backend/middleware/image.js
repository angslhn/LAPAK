const multer = require('multer');

const { error } = require('../helpers/response');

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('INVALID_FILE_FORMAT'), false);
  }
};

const mediaUploader = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 4,
  },
});

const image = (req, res, next) => {
  const imageMiddleware = mediaUploader.single('image');

  imageMiddleware(req, res, (err) => {
    if (err) {
      if (err.message === 'INVALID_FILE_FORMAT') {
        return error(
          res,
          'INVALID_FILE_FORMAT',
          'Format berkas tidak didukung. Gunakan JPG/PNG/WEBP',
          400
        );
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return error(
            res,
            'FILE_TOO_LARGE',
            'Ukuran berkas terlalu besar. Maksimal 3MB',
            413
          );
        }
      }

      return error(
        res,
        'IMAGE_UPLOAD_ERROR',
        'Terjadi kesalahan saat mengunggah gambar',
        500
      );
    }

    next();
  });
};

module.exports = image;
