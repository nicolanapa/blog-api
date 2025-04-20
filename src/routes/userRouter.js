import { Router } from "express";
import { body, validationResult } from "express-validator";
import process from "process";
import prisma from "../db/prisma.js";
import * as argon2 from "argon2";

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
        return res.status(400).json(errors);
    }

    console.log(req.body);

    if (
        (await prisma.user.findUnique({
            where: {
                username: req.body.username,
            },
        })) !== null
    ) {
        return res.status(409).json({ errors: "User already exists" });
    }

    let typeOfUser = "";

    if (req.body.blogAuthorSecretKey) {
        if (
            req.body.blogAuthorSecretKey === process.env.BLOG_AUTHOR_SECRET_KEY
        ) {
            typeOfUser = "blogAuthor";
        } else {
            return res.status(503).json({ errors: "Wrong Secret Key" });
        }
    } else {
        typeOfUser = "normalUser";
    }

    const hashedPassword = await argon2.hash(req.body.password);

    await prisma.user.create({
        data: {
            username: req.body.username,
            hashedPassword: hashedPassword,
            type: typeOfUser,
        },
    });

    // Return a JWT
    // Or redirect to /login with the needed credentials
    res.status(200).json();
});

// Check :id Type
userRouter.get("/:id", async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
        select: {
            id: true,
            username: true,
            hashedPassword: false,
            type: true,
        },
    });

    return res
        .status(user !== null ? 200 : 404)
        .json(user !== null ? user : { errors: "User doesn't exist" });
});

// Middleware needed
userRouter.put("/:id", async (req, res) => {});

// Middleware needed
userRouter.delete("/:id", async (req, res) => {});

userRouter.get("/:id/posts", async (req, res) => {
    const posts = await prisma.post.findMany({
        where: {
            userId: parseInt(req.params.id),
        },
    });

    return res.status(200).json(posts);
});

userRouter.get("/:id/comments", async (req, res) => {
    const comments = await prisma.comment.findMany({
        where: {
            userId: parseInt(req.params.id),
        },
    });

    return res.status(200).json(comments);
});

export default userRouter;
