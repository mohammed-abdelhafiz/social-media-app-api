import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const deleteImageFromCloudinary = async (
  publicId: string | null | undefined
): Promise<boolean> => {
  try {
    if (!publicId) return true;
    await cloudinary.uploader.destroy(publicId);
    return true;
  } catch (error) {
    console.error("Failed to delete image from Cloudinary", error);
    return false;
  }
};

export default cloudinary;
