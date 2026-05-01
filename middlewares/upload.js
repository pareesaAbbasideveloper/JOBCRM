// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");

// const tempDir = path.join(__dirname, "../tmp");

// // ensure temp folder exists
// if (!fs.existsSync(tempDir)) {
//   fs.mkdirSync(tempDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, tempDir);
//   },

//   filename: (req, file, cb) => {
//     const uniqueName =
//       Date.now() + "-" + Math.round(Math.random() * 1e9);

//     cb(null, uniqueName + path.extname(file.originalname));
//   }
// });

// // 🔥 file filter (important for CSV upload safety)
// const fileFilter = (req, file, cb) => {
//   const allowed = ["text/csv", "application/vnd.ms-excel"];

//   if (!allowed.includes(file.mimetype)) {
//     return cb(new Error("Only CSV files are allowed"), false);
//   }

//   cb(null, true);
// };

// module.exports = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// });