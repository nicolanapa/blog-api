const checkIdType = (idInParams = "id") => {
    return (req, res, next) => {
        console.log(isNaN(req.params[idInParams]));

        if (!isNaN(req.params[idInParams])) {
            return next();
        }

        res.status(400).json({ errors: "Bad id value" });
    };
};

export default checkIdType;
