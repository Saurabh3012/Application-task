const NewsAPI = require('newsapi');
const config = require("../config/config");

const newsapi = new NewsAPI(config.newsapi.apiKey);
const News = require("../models/News");
const Keywords = require("../models/Keywords");


// load mongoose package
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var connectionString =  'mongodb://'+config.mongodb.username+':'+config.mongodb.password+'@'+
    config.mongodb.host+':'+config.mongodb.port+'/application-task';

// var connectionString = 'mongodb://localhost:27017/Application-task';
console.log(connectionString);


mongoose.connect(connectionString)
    .then(function(){
        console.log('connection succesful');
    })
    .catch(function(err){
        console.error(err);
    });


Keywords.find(function (err, keyword) {
   if(err){
       console.error("Mongodb error");
   }else{
       // console.log(keyword);
       keyword.forEach(function (key) {

           if(key.keyword.length >= 3){
               newsapi.v2.everything({
                   q: key.keyword,
                   language: 'en',
                   sortBy: 'relevancy'
               }).then(function(response) {
                   console.dir(response.articles);
                   if( response.totalResults > 20 ){

                       var newsArray = [];
                       response.articles.forEach(function (article) {
                           var obj = {
                               keyword: key.keyword,
                               author: article.author,
                               title: article.title,
                               description: article.description,
                               publishedAt: article.publishedAt,
                               source: article.source,
                           };
                           if(newsArray.length < 20){
                               newsArray.push(obj);
                           }else{
                               return
                           }
                       });

                       console.log(newsArray);
                       News.insertMany(newsArray, function (e, d) {
                           if(e){
                               console.error("Mongodb insertion error");
                           } else{
                               console.log(d);
                           }
                       });

                   }
               }).catch(function (err) {
                   console.error(err);
               });
           }
       });
   }
});

