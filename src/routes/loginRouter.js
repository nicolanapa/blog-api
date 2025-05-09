import { Router } from "express";
import { body } from "express-validator";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import process from "process";
import prisma from "../db/prisma.js";
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
];

const loginRouter = new Router();

loginRouter.post(
    "/",
    userCredentials,
    checkValidationResult,
    async (req, res) => {
        const user = await prisma.user.findUnique({
            where: {
                username: req.body.username,
            },
        });

        if (user === null) {
            return res.status(404).json({ errors: "User doesn't exist" });
        }

        if (await argon2.verify(user.hashedPassword, req.body.password)) {
            // There needs to be a safer way to do this
            return res.status(200).json({
                status: "Logged successfully!",
                jwt: jwt.sign(
                    { id: user.id, type: user.type },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "2h",
                    },
                ),
            });
        }

        return res.status(403).json({ errors: "Wrong username or password" });
    },
);

export default loginRouter;
