import passport from "passport";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import process from "process";
import prisma from "./prisma.js";

passport.use(
    new JwtStrategy(
        {
            secretOrKey: process.env.JWT_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        },
        async (jwtPayload, done) => {
            const user = await prisma.user.findUnique({
                where: {
                    id: jwtPayload.id,
                    username: jwtPayload.username,
                    type: jwtPayload.type,
                },
                select: {
                    id: true,
                    username: true,
                    hashedPassword: false,
                    type: true,
                },
            });

            if (user !== null) {
                return done(null, user);
            } else {
                return done(null, false);
            }
        },
    ),
);

export default passport;
