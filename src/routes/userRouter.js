import { Router } from "express";
import { body } from "express-validator";
import process from "process";
import prisma from "../db/prisma.js";
import * as argon2 from "argon2";
import passport from "../db/passport.js";
import checkAuthorizationLevel from "../middlewares/checkAuthorizationLevel.js";
import checkValidationResult from "../middlewares/checkValidationResult.js";

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

const returnTypeOfUser = (blogAuthorSecretKey) => {
    let typeOfUser = "";

    if (blogAuthorSecretKey) {
        if (blogAuthorSecretKey === process.env.BLOG_AUTHOR_SECRET_KEY) {
            typeOfUser = "blogAuthor";
        } else {
            return 503;
        }
    } else {
        typeOfUser = "normalUser";
    }

    return typeOfUser;
};

const userRouter = new Router();

userRouter.get("/", async (req, res) => {
    return res.json(
        await prisma.user.findMany({
            omit: {
                hashedPassword: true,
            },
        }),
    );
});

userRouter.post(
    "/",
    userCredentials,
    checkValidationResult,
    async (req, res) => {
        if (
            (await prisma.user.findUnique({
                where: {
                    username: req.body.username,
                },
            })) !== null
        ) {
            return res.status(409).json({ errors: "User already exists" });
        }

        let typeOfUser = returnTypeOfUser(req.body.blogAuthorSecretKey);

        if (typeOfUser === 503) {
            return res.status(503).json({ errors: "Wrong Secret Key" });
        }

        const hashedPassword = await argon2.hash(req.body.password);

        await prisma.user.create({
            data: {
                username: req.body.username,
                hashedPassword: hashedPassword,
                type: typeOfUser,
            },
        });

        return await fetch(
            (process.env.SECURE_CONNECTION === "true" ? "https" : "http") +
                "://" +
                process.env.IP +
                ":" +
                process.env.PORT +
                "/login",
            {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: req.body.username,
                    password: req.body.password,
                }),
            },
        )
            .then((res) => res.json())
            .then((response) =>
                res.status(200).json({
                    status: "User successfully created",
                    jwt: response.jwt,
                }),
            )
            .catch(() =>
                res.status(200).json({
                    status: "User successfully created",
                }),
            );
    },
);

// Check :id Type
userRouter.get("/:id", async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(req.params.id),
        },
        omit: {
            hashedPassword: true,
        },
    });

    return res
        .status(user !== null ? 200 : 404)
        .json(user !== null ? user : { errors: "User doesn't exist" });
});

userRouter.put(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("id", false),
    userCredentials,
    checkValidationResult,
    async (req, res) => {
        const originalUser = await prisma.user.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if (originalUser === null) {
            return res.status(404).json({ errors: "User doesn't exist" });
        }

        let typeOfUser = returnTypeOfUser(req.body.blogAuthorSecretKey);

        if (typeOfUser === 503) {
            return res.status(503).json({ errors: "Wrong Secret Key" });
        }

        const hashedPassword = await argon2.hash(req.body.password);

        if (originalUser.username !== req.body.username) {
            const newUser = await prisma.user.findUnique({
                where: {
                    username: req.body.username,
                },
            });

            if (newUser !== null) {
                return res.status(409).json({
                    errors: "User already exists with the wanted username",
                });
            }
        }

        await prisma.user.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: {
                username: req.body.username,
                hashedPassword: hashedPassword,
                type: typeOfUser,
            },
        });

        return res.status(200).json({ status: "User updated successfully" });
    },
);

userRouter.delete(
    "/:id",
    passport.authenticate("jwt", { session: false }),
    checkAuthorizationLevel("id", false),
    async (req, res) => {
        if (
            (await prisma.user.findUnique({
                where: {
                    id: parseInt(req.params.id),
                },
            })) !== null
        ) {
            await prisma.comment.deleteMany({
                where: {
                    userId: parseInt(req.params.id),
                },
            });

            await prisma.post.deleteMany({
                where: {
                    userId: parseInt(req.params.id),
                },
            });

            await prisma.user.delete({
                where: {
                    id: parseInt(req.params.id),
                },
            });

            return res
                .status(200)
                .json({ status: "User deleted successfully" });
        }

        return res.status(404).json({ status: "User doesn't exist" });
    },
);

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
