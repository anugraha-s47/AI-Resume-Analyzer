// Write your code here
import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({ storage });