import bcrypt from "bcryptjs";
import { asyncHandler } from "../../core/utils/async-handler.js";
import User from "../../models/User.model.js";
import { ApiResponse } from "../../core/utils/api-response.js";
import { ApiError } from "../../core/utils/api-error.js";


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // 🔍 Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(400, "User with this email already exists");
    }

    // 🔒 Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🧑‍💻 Create new user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    // ✅ Send response using ApiResponse
    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                },
                "User registered successfully"
            )
        );
});

export { registerUser };
