# helled

A simple CMS for a simple purpose

Helled is extremely specialised. It's designed for personal use, but is modular enough to use for your own purposes.

To get started, simply run `yarn add helled` or `npm i --global helled`. Once you've done that, you can get into setting it up.

Helled is an editor for JSON files in a certain format, that being the following.
```json
{
    "url": {
        "title": "Page title",
        "intro": "Introduction paragraph (optional)",
        "body": "Page content"
    }
}

To use it in your code, add
```js
const helled = require("helled");

// ...

app.use(helled({
    posts: "/path/to/posts.json",
    reload: reloadFunction
}))
```

Please note that the `reload` attribute _is_ required, and an error will be thrown if it is missing.

Once that is set up, you'll also need a mongodb database (currently, only local databases are supported, though a PR to add remote support would be fairly simple) called helled containing the accounts for login. Currently there is no signup form, but it is a feature in the works. Each user in the mongodb database should contain:
```js
{
    "username": String,
    "password": bcrypt hash,
    "light": Boolean
}
```

The bcrypt hash is in the format output by [bcrypt.hash](https://www.npmjs.com/package/bcrypt).

If you find an issue, please submit an issue on GitHub (a PR would be even better).