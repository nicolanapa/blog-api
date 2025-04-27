import passport from "../db/passport.js";

const checkIfAnonymousOrUser = (req, res, next) =>
    passport.authenticate("jwt", { session: false }, (err, user) => {
        if (err) {
            return err;
        }

        if (user) {
            req.user = user;
            req.anonymous = false;
        } else {
            req.anonymous = true;
        }

        next();
    })(req, res, next);

export default checkIfAnonymousOrUser;
