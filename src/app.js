import express from "express";
import process from "process";

// passport strategy to be defined in ./db/passport.js

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.json({ "Available routes": ["/post", "/comment", "/user", "/login"] });
});

app.listen(PORT);
