import express from "express";
import dotenv from "dotenv"
import cors from "cors"
import { errorHandler } from "./src/core/middleware/errorHandler.js";
import authRouter from "./src/modules/auth/auth.route.js";
import userRouter from "./src/modules/user/user.route.js";


const app = express()

dotenv.config()

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use("/api/v1/auth", authRouter)
app.use("/api/v1/users", userRouter)

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: '🚀 Server is running smoothly - Module Structure',
        timestamp: new Date().toISOString()
    });
});

app.use(errorHandler)

export default app