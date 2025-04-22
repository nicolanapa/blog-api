const checkAuthorizationLevel = (idInParams, onlyBlogAuthor) => {
    return (req, res, next) => {
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
