import { Router } from "express";
import prisma from "../db/prisma.js";
import passport from "../db/passport.js";
import { body } from "express-validator";
import checkAuthorizationLevel from "../middlewares/checkAuthorizationLevel.js";
import checkValidationResult from "../middlewares/checkValidationResult.js";
import checkIdType from "../middlewares/checkIdType.js";
import checkIfAnonymousOrUser from "../middlewares/checkIfAnonymousOrUser.js";

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

postRouter.get(
    "/",
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("", true),
    async (req, res) => {
        return res.status(200).json(await prisma.post.findMany());
    },
);

postRouter.post(
    "/",
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("", true),
    postForm,
    checkValidationResult,
    async (req, res) => {
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

postRouter.get("/published", async (req, res) => {
    return res.status(200).json(
        await prisma.post.findMany({
            where: {
                isPublished: true,
            },
        }),
    );
});

postRouter.get(
    "/unpublished",
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("", true),
    async (req, res) => {
        return res.status(200).json(
            await prisma.post.findMany({
                where: {
                    isPublished: false,
                },
            }),
        );
    },
);

postRouter.get(
    "/:id",
    checkIdType(),
    checkIfAnonymousOrUser,
    async (req, res) => {
        let post;

        if (req.anonymous === true || req.user.type === "normalUser") {
            post = await prisma.post.findUnique({
                where: {
                    id: parseInt(req.params.id),
                    isPublished: true,
                },
            });
        } else {
            post = await prisma.post.findUnique({
                where: {
                    id: parseInt(req.params.id),
                },
            });
        }

        return res
            .status(post !== null ? 200 : 404)
            .json(post !== null ? post : { errors: "Post doesn't exist" });
    },
);

postRouter.put(
    "/:id",
    checkIdType(),
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("", true),
    postForm,
    checkValidationResult,
    async (req, res) => {
        const post = await prisma.post.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if (post === null) {
            return res.status(404).json({ status: "Post doesn't exist" });
        }

        await prisma.post.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: {
                title: req.body.title,
                content: req.body.content,
                isPublished: req.body.isPublished,
            },
        });

        return res.status(200).json({ status: "Post updated successfully" });
    },
);

postRouter.delete(
    "/:id",
    checkIdType(),
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("", true),
    async (req, res) => {
        if (
            await prisma.post.findUnique({
                where: {
                    id: parseInt(req.params.id),
                },
            })
        ) {
            await prisma.comment.deleteMany({
                where: {
                    postId: parseInt(req.params.id),
                },
            });

            await prisma.post.delete({
                where: {
                    id: parseInt(req.params.id),
                },
            });

            return res
                .status(200)
                .json({ status: "Post deleted successfully" });
        }

        return res.status(404).json({ status: "Post doesn't exist" });
    },
);

postRouter.get("/:id/comments", checkIdType(), async (req, res) => {
    return res.status(200).json(
        await prisma.comment.findMany({
            where: {
                postId: parseInt(req.params.id),
                post: {
                    isPublished: true,
                },
            },
        }),
    );
});

export default postRouter;
