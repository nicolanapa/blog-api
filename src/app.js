import express from "express";
import process from "process";
import cors from "cors";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import commentRouter from "./routes/commentRouter.js";
import loginRouter from "./routes/loginRouter.js";

const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 204,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

app.get("/", (req, res) => {
    res.json({ "Available routes": ["/post", "/comment", "/user", "/login"] });
});

app.use("/user", userRouter);

app.use("/post", postRouter);

app.use("/comment", commentRouter);

app.use("/login", loginRouter);

app.listen(PORT);
