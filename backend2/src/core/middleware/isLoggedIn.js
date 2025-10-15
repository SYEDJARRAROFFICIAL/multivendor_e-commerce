import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";
const isLoggedIn = asyncHandler(async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    throw new ApiError(401, "You are not logged in");
  }
  const decodedAccessToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );
  if (!decodedAccessToken || !decodedAccessToken._id) {
    throw new ApiError(401, "Invalid access token");
  }
  req.user = decodedAccessToken;
  next();
});

export { isLoggedIn };
