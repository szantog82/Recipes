
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

var uri = "mongodb://" + process.env.PASS + "@ds033966.mlab.com:33966/szantog82";
var recipeSchema = mongoose.Schema({
        name: String,
        season: String,
        type: String,
        containsDairy: Boolean,
        ingredients: [String],
        description: String  
});

var weeklyMenuSchema = mongoose.Schema({
        monday: String,
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String
});

var Recipe = mongoose.model('Recipe', recipeSchema);
var WeeklyMenu = mongoose.model('WeeklyMenu', weeklyMenuSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/getrecipes", function (req, res) {
        console.log("Fetching recipes...");
        mongoose.connect(uri);
        var db = mongoose.connection.collection('Recipes');
        db.find({}, function(err, data){
            data.toArray(function(err2, items){
                res.send(JSON.stringify(items));
                })
            })
});

app.post("/", function (req, res) {
  var body = req.body;
  if (bcrypt.compareSync(body.password, process.env.SECRET)) {
    var upload = new Recipe();
    var ingredientsArray = body.ingredients.split(', ');
    upload.name = body.name;
    upload.season = body.season;
    upload.type = body.type;
    upload.containsDairy = body.dairy;
    upload.ingredients = ingredientsArray;
    upload.description = body.description;
    console.log(body.name + " is uploading to db...");
    mongoose.connect(uri);
    var db = mongoose.connection.collection('Recipes');
    db.insert(upload);
    res.writeHead(301,{Location: '/'});
    res.end();
  }
  else {
    res.send("Rossz jelszó");
  }
});

app.get("/getweeklymenu", function(req, res){
    console.log("Fetching weekly menu...");
    mongoose.connect(uri);
        var db = mongoose.connection.collection('WeeklyMenu');
        db.find({}, function(err, data){
            data.toArray(function(err2, items){
                res.send(JSON.stringify(items[0]));
                })
            })
});

app.post("/setweeklymenu", function(req, res){
  console.log("SetWeeklyMenu post action received")
  var bodyText = Object.keys(req.body)[0];
  var body = JSON.parse(bodyText);
  console.log(body.password);
  if (bcrypt.compareSync(body.password, process.env.SECRET)) {
    console.log("siker")
    var upload = new WeeklyMenu();
    upload.monday = body.monday;
    upload.tuesday = body.tuesday;
    upload.wednesday = body.wednesday;
    upload.thursday = body.thursday;
    upload.friday = body.friday;
    upload.saturday = body.saturday;
    upload.sunday = body.sunday;
    console.log("WeeklyMenu is uploading to db...");
    console.log(upload)
    mongoose.connect(uri);
    var db = mongoose.connection.collection('WeeklyMenu');
    db.remove({}, function (err, sc){
              db.insert(upload);
        res.end("success");
              });
  }
  else {
    res.send("Rossz jelszó");
  }
});


var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
