const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: "dmv503tlb",
  api_key: "438173559891557",
  api_secret: "Dlj_jS_1mVRni6zIXTEwN6cuNUo",
});

const uploadToCloudinary = async (filePath) => {
  try {
    console.log("Uploading to Cloudinary:", filePath);
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'menu_logos',
      resource_type: 'auto' // Automatically detect file type
    });
    console.log("Cloudinary upload success:", result.secure_url);
    fs.unlink(filePath, () => {}); // delete temp file
    return result;
  } catch (err) {
    console.error('Cloudinary error:', err);
    throw err;
  }
};

module.exports = { uploadToCloudinary };
