import { Router } from "express";
import prisma from "../db/prisma.js";
import passport from "../db/passport.js";
import { body } from "express-validator";
import checkAuthorizationLevel from "../middlewares/checkAuthorizationLevel.js";
import checkValidationResult from "../middlewares/checkValidationResult.js";
import checkIdType from "../middlewares/checkIdType.js";

const commentValidation = body("content")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Content must not be empty")
    .isLength({ max: 1024 })
    .withMessage("Content must not exceed 1024 characters");

const commentRouter = new Router();

commentRouter.get("/", async (req, res) => {
    return res.status(200).json(
        await prisma.comment.findMany({
            include: {
                user: {
                    select: {
                        username: true,
                    },
                },
            },
        }),
    );
});

commentRouter.post(
    "/:postId",
    checkIdType("postId"),
    passport.authenticate("jwt", { session: false }),
    commentValidation,
    checkValidationResult,
    async (req, res) => {
        const post = await prisma.post.findUnique({
            where: {
                id: parseInt(req.params.postId),
            },
        });

        if (post === null) {
            return res.status(404).json({ errors: "Post not found" });
        }

        if (!post.isPublished) {
            return res
                .status(400)
                .json({ errors: "Post is not published yet" });
        }

        await prisma.comment.create({
            data: {
                postId: parseInt(req.params.postId),
                userId: parseInt(req.user.id),
                content: req.body.content,
            },
        });

        return res.status(200).json({ status: "Comment created successfully" });
    },
);

commentRouter.get("/:id", checkIdType(), async (req, res) => {
    const comment = await prisma.comment.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
        include: {
            user: {
                select: {
                    username: true,
                },
            },
        },
    });

    return res
        .status(comment !== null ? 200 : 404)
        .json(comment !== null ? comment : { errors: "Comment doesn't exist" });
});

commentRouter.put(
    "/:id",
    checkIdType(),
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("id", false, "Comment"),
    commentValidation,
    checkValidationResult,
    async (req, res) => {
        const comment = await prisma.comment.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if (comment === null) {
            return res.status(404).json({ errors: "Comment doesn't exist" });
        }

        await prisma.comment.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: {
                content: req.body.content,
                publishDate: new Date(),
            },
        });

        return res.status(200).json({ status: "Comment updated successfully" });
    },
);

commentRouter.delete(
    "/:id",
    checkIdType(),
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("id", false, "Comment"),
    async (req, res) => {
        const comment = await prisma.comment.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if (comment === null) {
            return res.status(404).json({ errors: "Comment doesn't exist" });
        }

        await prisma.comment.delete({
            where: {
                id: parseInt(req.params.id),
            },
        });

        return res.status(200).json({ status: "Comment deleted successfully" });
    },
);

export default commentRouter;
