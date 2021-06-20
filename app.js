//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const port = 3000;
const homeStartingContent = "Hi welcome to Simon's playground!";
const aboutContent = "My name is Simon, you can call me tinman too. I'm a software engineer with an enthusiasm for graphics engineering and also web development";
const contactContent = "you can contact me through my email at: simon@tinmansimon.com";
const app = express();

const _ = require('lodash');

var posts = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(rec, res){
  res.render("home", {
    homeStartingContent : homeStartingContent,
    posts : posts
  });
})

app.get("/about", function(rec, res){
  res.render("about", {aboutContent : aboutContent});
})

app.get("/contact", function(rec, res){
  res.render("contact", {contactContent : contactContent});
})

app.get("/compose", function(rec, res){
  res.render("compose");
})

app.get("/posts/:post", function(rec, res){
  let post = rec.params.post;
  let targetPostValid = false;
  posts.forEach(function(p){
    if (_.lowerCase(p.title) === _.lowerCase(post)) {
      targetPostValid = true;
      res.render("contentPage", {
        title : p.title,
        content : p.content
      });
    }
  })
  if (!targetPostValid) {
    res.render("contentPage", {
      title : "Error Not found",
      content : ""
    });
  }
})

app.post("/compose", function(rec, res){
  posts.push({
    title : rec.body.composeTitle,
    hrefLink : rec.body.composeTitle.replace(/\s/g, "-"),
    content : rec.body.composeContent,
    truncatedContent : _.truncate(rec.body.composeContent, {'length' : 100})
  });
  res.redirect("/");
})

app.listen(port, function() {
  console.log("Server started on port 3000");
});
