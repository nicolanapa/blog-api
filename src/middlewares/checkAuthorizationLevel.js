import prisma from "../db/prisma.js";

const checkAuthorizationLevel = (
    idInParams,
    onlyBlogAuthor,
    otherTypeOfModel = "",
) => {
    return async (req, res, next) => {
        if (otherTypeOfModel !== "") {
            if (
                otherTypeOfModel === "Comment" &&
                !onlyBlogAuthor &&
                req.user.type === "normalUser"
            ) {
                const comment = await prisma.comment.findUnique({
                    where: {
                        id: parseInt(req.params[idInParams]),
                    },
                });

                if (comment.userId === parseInt(req.user.id)) {
                    return next();
                }
            }
        }

        if (
            !onlyBlogAuthor &&
            req.user.type === "normalUser" &&
            parseInt(req.params[idInParams]) === parseInt(req.user.id)
        ) {
            return next();
        } else if (req.user.type === "blogAuthor") {
            return next();
        }

        return res.status(403).json({
            errors: "You don't have proper authorization",
        });
    };
};

export default checkAuthorizationLevel;
