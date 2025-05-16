# Blog Back-end

This Project is inspirated by this [project](https://www.theodinproject.com/lessons/node-path-nodejs-blog-api).
This is the back-end version, you can find the front-end [here](https://github.com/nicolanapa/blog-frontend/).
<br />
<br />
This is a "simple" blog interface with various middlewares.
<br />
These are the most common features:

-   Allows the creation of
    -   Users
        -   Who are divided into
            -   normalUser (can only view published posts and comment)
            -   blogAuthor (can post, comment and manage everything)
    -   Posts
    -   Comments
-   Uses Prisma ORM with a PostgreSQL DB
-   Strict authorization checking
-   Authorization via JWT tokens as a way of "learning" how to use them (I would normally use cookies, like in [fifo-social-api](https://github.com/nicolanapa/fifo-social-api/), which is a way complex project)
-   Passwords are safely hashed and save into the User model using argon2-id
-   Strict data form checking using express-validator

You can find it hosted [here](https://blog-api-u57b.onrender.com/)

To be able to create the blogAuthor type of User here's the BLOG_AUTHOR_SECRET_KEY secret variable you can use:

> hUqDmZMZXZ80LWHqW4arhYbllNV7p^aKoQtVRyo&ugqlW5yhP^zUZ&$c9LYI$9wN

## Secret .env Variables

An Example (a development environment):

```
SECURE_CONNECTION=false
IP="localhost"
PORT=3000
DATABASE_URL="postgresql://....."
BLOG_AUTHOR_SECRET_KEY="2HI#9z%oZ!Kvya8CCqln0Wu%8tO$ZBW!y13HHba6Qil&B2hgx07htLMgC9x%XRH*"
CORS_ORIGIN="http://localhost:5173"
CORS_ORIGIN_2="http://localhost:5174"
```

```
SECURE_CONNECTION   -> A Boolean value about using or not HTTPS locally
IP    -> Its local address (localhost) used to fetch itself in POST /user/
PORT    -> The port used by the API
DATABASE_UR    -> A PostgreSQL connection URL
BLOG_AUTHOR_SECRET_KEY    -> A 64 random key used for creating securely a blogAuthor User
CORS_ORIGIN    -> The first address of an application from blog-frontend
CORS_ORIGIN_2    -> The second address of an application from blog-frontend
```
