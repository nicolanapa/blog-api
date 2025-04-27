const checkIdType = (idInParams = "id") => {
    return (req, res, next) => {
        if (!isNaN(req.params[idInParams])) {
            return next();
        }

        res.status(400).json({ errors: "Bad id value" });
    };
};

export default checkIdType;
