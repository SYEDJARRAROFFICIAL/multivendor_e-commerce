import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ZodError } from "zod";

const validate = (schema) =>
  asyncHandler(async (req, res, next) => {
    try {
      // 🧩 Single schema (body only)
      if (schema?.safeParse) {
        const result = schema.safeParse(req.body);
        if (!result.success) {
          throw result.error; // This throws the ZodError
        }
        // Replace req.body with validated data (strips extra fields)
        req.body = result.data;
      } else {
        // 🧩 Multiple schema keys (body, query, params)
        if (schema?.body) {
          const result = schema.body.safeParse(req.body);
          if (!result.success) throw result.error;
          req.body = result.data;
        }
        if (schema?.query) {
          const result = schema.query.safeParse(req.query);
          if (!result.success) throw result.error;
          req.query = result.data;
        }
        if (schema?.params) {
          const result = schema.params.safeParse(req.params);
          if (!result.success) throw result.error;
          req.params = result.data;
        }
      }

      next();
    } catch (error) {
      // 🧾 Handle Zod validation errors cleanly
      if (error instanceof ZodError) {
        // ✅ FIX: Use error.issues instead of error.errors
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));

        // ❌ Throw ApiError to keep consistent format
        throw new ApiError(400, "Validation failed", formattedErrors);
      }

      // 🔥 Unexpected error (schema not Zod, etc.)
      console.error("Unexpected validation error:", error);
      throw new ApiError(500, "Unexpected validation error");
    }
  });

export { validate };

// import { ApiError } from "../utils/api-error.js";
// import { asyncHandler } from "../utils/async-handler.js";
// import { ZodError } from "zod";

// const validate = (schema) =>
//     asyncHandler(async (req, res, next) => {
//         try {
//             // 🧩 Single schema (body only)
//             if (schema?.safeParse) {
//                 schema.parse(req.body);
//             } else {
//                 // 🧩 Multiple schema keys (body, query, params)
//                 if (schema?.body) schema.body.parse(req.body);
//                 if (schema?.query) schema.query.parse(req.query);
//                 if (schema?.params) schema.params.parse(req.params);
//             }

//             next();
//         } catch (error) {
//             // 🧾 Handle Zod validation errors cleanly
//             if (error instanceof ZodError) {
//                 const formattedErrors = (error.errors || []).map((err) => ({
//                     field: err.path.join("."),
//                     message: err.message,
//                 }));

//                 // ❌ Throw ApiError to keep consistent format
//                 throw new ApiError(400, "Validation failed", formattedErrors);
//             }

//             // 🔥 Unexpected error (schema not Zod, etc.)
//             console.error("Unexpected validation error:", error);
//             throw new ApiError(500, "Unexpected validation error", [
//                 { message: error.message },
//             ]);
//         }
//     });

// export { validate };
