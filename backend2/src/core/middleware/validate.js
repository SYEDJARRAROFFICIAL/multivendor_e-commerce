import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ZodError } from "zod";

const validate = (schema) =>
  asyncHandler(async (req, res, next) => {
    try {
      // 🧩 Single schema (body only)
      if (schema?.safeParse) {
        schema.parse(req.body);
      } else {
        // 🧩 Multiple schema keys (body, query, params)
        if (schema?.body) schema.body.parse(req.body);
        if (schema?.query) schema.query.parse(req.query);
        if (schema?.params) schema.params.parse(req.params);
      }

      next();
    } catch (error) {
      // 🧾 Handle Zod validation errors cleanly
      if (error instanceof ZodError) {
        // Fix: Ensure we always have an array and map correctly
        const formattedErrors = error.issues.map((issue) => ({
          field: issue.path.join(".") || "unknown",
          message: issue.message,
          code: issue.code,
        }));

        console.log("Zod validation errors:", formattedErrors); // Debug log

        // ❌ Throw ApiError to keep consistent format
        throw new ApiError(400, "Validation failed", formattedErrors);
      }

      // 🔥 Unexpected error (schema not Zod, etc.)
      console.error("Unexpected validation error:", error);
      throw new ApiError(500, "Unexpected validation error", [
        { field: "unknown", message: error.message || "Unknown error" },
      ]);
    }
  });

export { validate };
