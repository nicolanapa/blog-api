import { Router } from "express";
import { body, validationResult } from "express-validator";
import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import process from "process";
import prisma from "../db/prisma.js";
import * as crypto from "crypto";

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

loginRouter.post("/", userCredentials, async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }

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
            jwt: jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: "2h",
            }),
        });
    }
});

export default loginRouter;
