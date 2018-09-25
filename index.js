const express = require("express");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require("bcrypt");

var config = {

}

mongoose.connect('mongodb://localhost/helled', { useNewUrlParser: true });

const Schema = mongoose.Schema;
const UserDetail = new Schema({
      username: String,
      password: String,
      light: Number
    });
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

const app = express();

app.use(session({secret: Math.random().toString()}))
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

app.use("/admin/npm", express.static(__dirname + "/node_modules/"))

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "pug");

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  UserDetails.findById(id, function(err, user) {
    cb(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
      UserDetails.findOne({
        username: username
      }, function(err, user) {
        if (err) {
          return done(err);
        }

        if (!user) {
          return done(null, false);
        }

        var correct = bcrypt.compareSync(password, user.password);

        if (!correct) {
          return done(null, false);
        }
        return done(null, user);
      });
  }
));

app.post('/admin/login', passport.authenticate('local', { failureRedirect: '/admin/login' }), function(req, res) {
  res.redirect(req.body.from || '/admin/edit/');
});

app.get("/admin/login", function(req, res) {
  res.render(__dirname + "/views/login", {from: req.query.from})
})

app.use("/admin/edit/", function(req, res) {
  if(req.user) {
    var posts = JSON.parse(fs.readFileSync(config.posts, "utf-8"))
    var article = posts[req.url.replace(/^\/$/, "/index")] || {}
    res.render(__dirname + "/views/edit", {
      article, posts, page: req.url, theme: req.user.light
    })
  } else {
    res.redirect("/admin/login?from=/admin/edit" + req.url)
  }
})

app.put("*", function(req, res) {
  if(req.user){
    var posts = JSON.parse(fs.readFileSync(config.posts, "utf-8"))
    posts[req.url] = posts[req.url] || {}
    for(let i in req.body.changes) {
      posts[req.url][i] = req.body.changes[i];
    }
    fs.writeFileSync(config.posts, JSON.stringify(posts))
    config.reload();
    res.json(req.body)
  } else {
    res.status(401);
    res.send("no")
  }
})

app.get("/admin", function(req, res) {
  if(req.user) {
    res.redirect("/admin/edit/new")
  } else {
    res.redirect("/admin/login")
  }
})

module.exports = function hell(conf) {
  config = conf;
  return app;
}