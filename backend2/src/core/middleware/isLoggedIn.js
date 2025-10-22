import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import jwt from "jsonwebtoken";

const isLoggedIn = (allowedRoles = []) =>
  asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    console.log("Access Token:", accessToken); // Debug log

    if (!accessToken) {
      throw new ApiError(401, "You are not logged in");
    }

    try {
      const decodedAccessToken = jwt.verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      );
      console.log("Decoded Access Token:", decodedAccessToken); // Debug log

      if (!decodedAccessToken || !decodedAccessToken._id) {
        throw new ApiError(401, "Invalid access token");
      }

      let currentRole = null;
      let entityType = null;

      // Check if it's a user token (has userRole)
      if (decodedAccessToken.userRole) {
        currentRole = decodedAccessToken.userRole;
        entityType = "user";
        req.user = decodedAccessToken;
        console.log("User authenticated:", req.user);
      }
      // Check if it's an admin token (has adminRole)
      else if (decodedAccessToken.adminRole) {
        currentRole = decodedAccessToken.adminRole;
        entityType = "admin";
        req.admin = decodedAccessToken;
        console.log("Admin authenticated:", req.admin);
      } else {
        throw new ApiError(401, "Invalid token: No role information found");
      }

      // If specific roles are required, check if current role is allowed
      if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
        throw new ApiError(
          403,
          `Access denied. Required roles: [${allowedRoles.join(
            ", "
          )}], but got: ${currentRole}`
        );
      }

      // Add role info to request for easy access
      req.currentRole = currentRole;
      req.entityType = entityType;

      next();
    } catch (jwtError) {
      console.log("JWT Error:", jwtError); // Debug log

      // Re-throw ApiError instances
      if (jwtError instanceof ApiError) {
        throw jwtError;
      }

      // Handle JWT-specific errors
      if (jwtError.name === "TokenExpiredError") {
        throw new ApiError(401, "Access token has expired");
      } else if (jwtError.name === "JsonWebTokenError") {
        throw new ApiError(401, "Invalid access token");
      } else {
        throw new ApiError(401, "Token verification failed");
      }
    }
  });

export { isLoggedIn };

// import { ApiError } from "../utils/api-error.js";
// import { asyncHandler } from "../utils/async-handler.js";
// import jwt from "jsonwebtoken";

// const isLoggedIn = asyncHandler(async (req, res, next) => {
//   const accessToken = req.cookies.accessToken;
//   console.log("Access Token:", accessToken); // Debug log
//   if (!accessToken) {
//     throw new ApiError(401, "You are not logged in");
//   }

//   try {
//     const decodedAccessToken = jwt.verify(
//       accessToken,
//       process.env.ACCESS_TOKEN_SECRET
//     );
//     console.log("Decoded Access Token:", decodedAccessToken); // Debug log
//     if (!decodedAccessToken || !decodedAccessToken._id) {
//       throw new ApiError(401, "Invalid access token");
//     }

//     req.user = decodedAccessToken;
//     console.log("User authenticated:", req.user); // Debug log
//     next();
//   } catch (jwtError) {
//     // Handle JWT verification errors
//     if (jwtError.name === "TokenExpiredError") {
//       throw new ApiError(401, "Access token has expired");
//     } else if (jwtError.name === "JsonWebTokenError") {
//       throw new ApiError(401, "Invalid access token");
//     } else {
//       throw new ApiError(401, "Token verification failed");
//     }
//   }
// });

// export { isLoggedIn };
