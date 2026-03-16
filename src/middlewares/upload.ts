import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req) => ({
    folder: "postinger-social-media-app",
    public_id: `${req.JwtPayload?.userId}-${Date.now()}`,
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ quality: "auto" }, { fetch_format: "webp" }],
  }),
});

export const upload = multer({ storage });
