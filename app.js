//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const port = 3000;

const homeStartingContent = "Hi welcome to Simon's playground!";
const aboutContent = "My name is Simon, you can call me tinman too. I'm a software engineer with an enthusiasm for graphics engineering and also web development";
const contactContent = "you can contact me through my email at: simon@tinmansimon.com";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(rec, res){
  res.render("home", {homeStartingContent : homeStartingContent});
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

app.post("/compose", function(rec, res){
  console.log(rec.body.composeMsg);
  //res.redirect("/compose");
})









app.listen(port, function() {
  console.log("Server started on port 3000");
});
