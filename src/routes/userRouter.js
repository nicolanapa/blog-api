import { Router } from "express";
import prisma from "../db/prisma.js";

const userRouter = new Router();

userRouter.get("/", async (req, res) => {
    return res.json(await prisma.user.findMany());
});

export default userRouter;
