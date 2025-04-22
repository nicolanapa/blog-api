import { Router } from "express";
import prisma from "../db/prisma.js";
import passport from "../db/passport.js";
import { body, validationResult } from "express-validator";
import checkAuthorizationLevel from "../middlewares/checkAuthorizationLevel.js";

const postForm = [
    body("title")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Title must not be empty")
        .isLength({ max: 32 })
        .withMessage("Title must be between 1 and 32 chars length"),
    body("content")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Content must not be empty")
        .isLength({ max: 4096 })
        .withMessage("Content must be between 1 and 4096 chars length"),
    body("isPublished")
        .trim()
        .escape()
        .default(true)
        .toBoolean()
        .isBoolean() // Not needed
        .withMessage("isPublished must be a Boolean (true or false value)"),
];

const postRouter = new Router();

postRouter.get("/", async (req, res) => {
    return res.status(200).json(
        await prisma.post.findMany({
            where: {
                isPublished: true,
            },
        }),
    );
});

postRouter.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("", true),
    postForm,
    async (req, res) => {
        console.log(1);

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json(errors);
        }

        console.log(req.body);

        await prisma.post.create({
            data: {
                userId: parseInt(req.user.id),
                title: req.body.title,
                content: req.body.content,
                isPublished: req.body.isPublished,
            },
        });

        return res.status(200).json({ status: "Post created successfully" });
    },
);

postRouter.get("/:id", async (req, res) => {});

postRouter.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("", true),
    async (req, res) => {},
);

postRouter.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("", true),
    async (req, res) => {},
);

postRouter.get("/:id/comments", async (req, res) => {});

export default postRouter;
