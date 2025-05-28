import multer from "multer";

const storage = multer.memoryStorage();
const upload = {
  dest: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedFormats = ["image/jpeg", "image/png"];
    if (allowedFormats.includes(file.mimeType)) {
      callback(null, true);
    } else {
      callback(new Error("Upload either a JPEG or PNG"), false);
    }
  },
};

export default upload;
