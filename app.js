//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const port = 3000;
const app = express();
const _ = require('lodash');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const mongoose = require("mongoose");
const mongoUrl = "";

let debugMode = true;
let metaData = {};
let allPosts = [];
function debugLog(s){
  if (debugMode) {
    console.log(s);
  }
}

function errorLog(s){
  console.log(s);
}

const postSchema = new mongoose.Schema({
  title : {
    type: String,
    required: [true, "no title"]
  },
  hrefLink : {
    type: String,
    required: [true, "no hrefLink"]
  },
  content : {
    type: String,
    required: [true, "no content"]
  },
  truncatedContent : {
    type: String,
    required: [true, "no truncatedContent"]
  }
});
const PostModel = mongoose.model("post", postSchema, "posts");
const metaDataSchema =  new mongoose.Schema({
  homeStartingContent : String,
  aboutContent : String,
  contactContent : String
});
const MetaModel = mongoose.model("meta", metaDataSchema, "metadata");

function connectMongoose(url){
  debugLog("connect using mongoose");
  mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});
  findAllAndCallBack.connectedToMongoose = true;
}

function findAllAndCallBack(url, params){
  if (findAllAndCallBack.connectedToMongoose === undefined) {
    findAllAndCallBack.connectedToMongoose = false;
  }
  if (!findAllAndCallBack.connectedToMongoose) connectMongoose(url);

  if (Array.isArray(params.callbackParamsList) && params.callbackParamsList.length > 0) {
    param = params.callbackParamsList.pop();
    if ((!param.hasOwnProperty("callback")) || (!param.hasOwnProperty("model"))) return;
  }
  else return;

  param.model.find({}, function(err, docs){
    if (err) {
      errorLog(err);
    } else {
      debugLog("succeed!");
      param.callback(docs, params);
    }
  });
}

function homePagePostsCallback(posts, params) {
  if (!params.res) { return; }
  allPosts = posts;
  params.res.render("home", {
    homeStartingContent : metaData.homeStartingContent,
    posts : allPosts
  });
}


function homepageMetaCallback(metas, params){
  if (metas.length != 1) {
    errorLog("metalCallback have 0 or more than 1 metadata records in database!");
    callbackParams.res.render("home", {
      homeStartingContent : "Error homepage can't get meta data!",
      posts : []
    });
    return;
  }
  metaData = metas[0];
  if (params.renderOnMetaCallback === true) {
    params.res.render(params.renderTitle, metaData);
  }
  findAllAndCallBack(mongoUrl, params);
}

function getMetaAndRender(res, renderTitle, directRenderObj, renderOnMetaCallback = false){
  //if metaData is incomplete, get data first.
  if ((allPosts.length === 0) || (metaData.aboutContent === undefined)) {
    debugLog("allPosts.length = " + allPosts.length);
    debugLog("metaData: ");
    debugLog(metaData);
    findAllAndCallBack(mongoUrl, {
      res : res,
      callbackParamsList : [{
        callback : homepageMetaCallback,
        model : MetaModel
      }],
      renderOnMetaCallback : renderOnMetaCallback,
      renderTitle : renderTitle
    });
  } else {
    res.render(renderTitle, directRenderObj);
  }
}


app.get("/", function(rec, res){
  if (allPosts.length === 0 || !metaData.hasOwnProperty("homeStartingContent")) {
    findAllAndCallBack(mongoUrl, {
      res : res,
      callbackParamsList : [{
          callback : homePagePostsCallback,
          model : PostModel
        }, {
          callback : homepageMetaCallback,
          model : MetaModel
      }]
    });
  } else {
    res.render("home", {
      homeStartingContent : metaData.homeStartingContent,
      posts : allPosts
    });
  }
});

app.get("/about", function(rec, res){
  getMetaAndRender(res, "about", {aboutContent : metaData.aboutContent}, true);
});

app.get("/contact", function(rec, res){
  getMetaAndRender(res, "contact", {contactContent : metaData.contactContent}, true);
});

app.get("/compose", function(rec, res){
  res.render("compose");
});

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
});

app.post("/compose", function(rec, res){
  postItem = {
    title : rec.body.composeTitle,
    hrefLink : rec.body.composeTitle.replace(/\s/g, "-"),
    content : rec.body.composeContent,
    truncatedContent : _.truncate(rec.body.composeContent, {'length' : 100})
  };
  mongoose.connect(mongoUrl, {useNewUrlParser: true, useUnifiedTopology: true});
  const newItem = new PostModel(postItem);
  newItem.save(function(err){
    if (err) {
      errorLog(err);
    } else return;
  });
  res.redirect("/");
});

app.listen(port, function() {
  console.log("Server started on port 3000");
});
