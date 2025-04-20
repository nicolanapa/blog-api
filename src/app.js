import express from "express";
import process from "process";
import userRouter from "./routes/userRouter.js";
import postRouter from "./routes/postRouter.js";
import commentRouter from "./routes/commentRouter.js";
import loginRouter from "./routes/loginRouter.js";

// passport strategy to be defined in ./db/passport.js

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ "Available routes": ["/post", "/comment", "/user", "/login"] });
});

app.use("/user", userRouter);

app.use("/post", postRouter);

app.use("/comment", commentRouter);

app.use("/login", loginRouter);

app.listen(PORT);
