import cloudinary from "../config/cloudinary.config";

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