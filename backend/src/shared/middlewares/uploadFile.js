const multer = require("multer");
const fs = require("fs");
const path = require("path");

const PUBLIC_ROOT = path.resolve(process.cwd(), "public");
const FILES_DIR = path.join(PUBLIC_ROOT, "files");
const IMAGES_DIR = path.join(PUBLIC_ROOT, "images");

[PUBLIC_ROOT, FILES_DIR, IMAGES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.originalname.includes("xlsx")) cb(null, FILES_DIR);
    else cb(null, IMAGES_DIR);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      Date.now() +
        "-" +
        file.originalname
          .replace(/[^\x00-\x7F]/g, "")
          .split(" ")
          .join("")
    );
  },
});

const upload = multer({ storage: storage });

const uploadFile = (type) => (req, res, next) => {
  upload.single(type)(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).send(err.message);
    } else if (err) {
      return res.status(500).send(err.message);
    }
    next();
  });
};

module.exports = uploadFile;
