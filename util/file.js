const path = require("path");
const fs = require("fs");

const clearImage = (filePath) => {
  const filePaths = path.join(__dirname, "..", filePath).replace(/\\/g, "/");
  fs.unlink(filePaths, (err) => {
    if (err) {
      console.error("Error deleting file:", err);
    }
  });
};
exports.clearImage = clearImage;
