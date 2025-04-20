import { Router } from "express";
import { body, validationResult } from "express-validator";
import process from "process";
import prisma from "../db/prisma.js";

const userCredentials = [
    body("username")
        .trim()
        .notEmpty()
        .withMessage("Username can't be empty")
        .isLength({ min: 2, max: 32 })
        .withMessage("Username must be between 2 and 32 chars length"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password can't be empty")
        .isLength({ min: 4, max: 128 })
        .withMessage("Password must be between 4 and 128 chars length"),
    body("blogAuthorSecretKey")
        .trim()
        .optional()
        .isLength({ min: 64, max: 64 })
        .withMessage("Invalid length of secret key (64 chars length)"),
];

const userRouter = new Router();

userRouter.get("/", async (req, res) => {
    return res.json(await prisma.user.findMany());
});

userRouter.post("/", userCredentials, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        res.status(400).json(errors);
    }

    console.log(req.body);

    if (req.body.blogAuthorSecretKey) {
        if (
            req.body.blogAuthorSecretKey === process.env.BLOG_AUTHOR_SECRET_KEY
        ) {
            // Create blogAuthor User
        } else {
            res.status(503).json({ errors: "Wrong Secret Key" });
        }
    } else {
        // Create normalUser User
    }
});

export default userRouter;
