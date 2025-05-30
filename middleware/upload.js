import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, callback) => {
  const allowedFormats = ["image/jpeg", "image/png"];
  if (allowedFormats.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error("Upload either a JPEG or PNG"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export default upload;
