var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
require('mongoose-long')(mongoose);
var Long = mongoose.Schema.Types.Long;
var bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '50mb',
    extended: false
  }));

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
    sunday: String,
    mondayDinner: String,
    tuesdayDinner: String,
    wednesdayDinner: String,
    thursdayDinner: String,
    fridayDinner: String,
    saturdayDinner: String,
    sundayDinner: String,
    time: Long
});

var Recipe = mongoose.model('Recipe', recipeSchema);
var WeeklyMenu = mongoose.model('WeeklyMenu', weeklyMenuSchema);

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
});

app.get("/getrecipes", function(req, res) {
    console.log("Fetching recipes...");
    mongoose.connect(uri, {
        socketTimeoutMS: 0,
        keepAlive: true,
        reconnectTries: 30
    });
    var db = mongoose.connection.collection('Recipes');
    db.find({}, function(err, data) {
        data.toArray(function(err2, items) {
            res.send(JSON.stringify(items));
        })
    })
});

app.post("/", function(req, res) {
    var body = req.body;
    if(body.password == undefined){
        var bodyText = Object.keys(req.body)[0];
        body = JSON.parse(bodyText);
    }
    if (bcrypt.compareSync(body.password, process.env.SECRET) || bcrypt.compareSync(body.password, process.env.SECRETWEEKLY)) {
        var upload = new Recipe();
        var ingredientsArray = body.ingredients.split(', ');
        upload.name = body.name;
        upload.season = body.season;
        upload.type = body.type;
        upload.containsDairy = body.dairy;
        upload.ingredients = ingredientsArray;
        upload.description = body.description;
        console.log(body.name + " is uploading to db...");
        mongoose.connect(uri, {
            socketTimeoutMS: 0,
            keepAlive: true,
            reconnectTries: 30
        });
        var db = mongoose.connection.collection('Recipes');
        db.insert(upload);
        res.writeHead(301, {
            Location: '/'
        });
        res.end("success");
    } else {
        res.send("Rossz jelszó");
    }
});

app.get("/getweeklymenu", function(req, res) {
    console.log("Fetching weekly menu...");
    mongoose.connect(uri, {
        socketTimeoutMS: 0,
        keepAlive: true,
        reconnectTries: 30
    });
    var db = mongoose.connection.collection('WeeklyMenu');
    db.find().sort({
        "time": -1
    }).toArray(function(err2, items) {
        res.send(items[0]);
    })
});

app.get("/getprevmenus", function(req, res) {
    console.log("Fetching weekly menu...");
    mongoose.connect(uri, {
        socketTimeoutMS: 0,
        keepAlive: true,
        reconnectTries: 30
    });
    var db = mongoose.connection.collection('WeeklyMenu');
    db.find().sort({
        "time": 1
    }).toArray(function(err2, items) {
        res.send(JSON.stringify(items));
    })
});

app.post("/setweeklymenu", function(req, res) {
    console.log("SetWeeklyMenu post action received")
    var bodyText = Object.keys(req.body)[0];
    var body = JSON.parse(bodyText);
    var upload = new WeeklyMenu();

    if (bcrypt.compareSync(body.password, process.env.SECRETWEEKLY)) {
        var upload = new WeeklyMenu();
        upload.monday = body.monday;
        upload.tuesday = body.tuesday;
        upload.wednesday = body.wednesday;
        upload.thursday = body.thursday;
        upload.friday = body.friday;
        upload.saturday = body.saturday;
        upload.sunday = body.sunday;
        upload.mondayDinner = body.mondayDinner;
        upload.tuesdayDinner = body.tuesdayDinner;
        upload.wednesdayDinner = body.wednesdayDinner;
        upload.thursdayDinner = body.thursdayDinner;
        upload.fridayDinner = body.fridayDinner;
        upload.saturdayDinner = body.saturdayDinner;
        upload.sundayDinner = body.sundayDinner;
        upload.time = parseInt(body.time);
        console.log("WeeklyMenu is uploading to db...");
        console.log(upload);
        mongoose.connect(uri, {
            socketTimeoutMS: 0,
            keepAlive: true,
            reconnectTries: 30
        });
        var db = mongoose.connection.collection('WeeklyMenu');
        db.insert(upload);
        res.end("success");
    } else {
        res.send("Rossz jelszó");
    }
});

app.post("/financebackup", function(req, res) {
    console.log("FinanceBackup post action received")
    var bodyText = Object.keys(req.body)[0];
    var body = JSON.parse(bodyText);

    if (bcrypt.compareSync(body.password, process.env.SECRETWEEKLY)) {
        var upload = {};
        upload["username"] = body.username;
        upload["initialbalance"] = body.initialbalance;
        upload["balance"] = body.balance;
        upload["categorylist"] = body.categorylist;
        upload["repetitivedata"] = body.repetitivedata;
        var d = new Date();
        upload["savetime"] = d.getTime();
        console.log("FinanceBackup is uploading to db...");
        mongoose.connect(uri, {
            socketTimeoutMS: 0,
            keepAlive: true,
            reconnectTries: 30
        });
        var db = mongoose.connection.collection('FinanceBackup');
        db.insert(upload);
        res.end("success");
    } else {
        res.send("Rossz jelszó");
    }
});

app.post("/getfinancebackup", function(req, res){
  console.log("GetfinanceBackup post action received")
    var bodyText = Object.keys(req.body)[0];
    var body = JSON.parse(bodyText);
  
    if (bcrypt.compareSync(body.password, process.env.SECRETWEEKLY)) {
        mongoose.connect(uri, {
          socketTimeoutMS: 0,
          keepAlive: true,
          reconnectTries: 30
        });
        var db = mongoose.connection.collection('FinanceBackup');
        db.find({}, function(err, data) {
            data.toArray(function(err2, items) {
              items.sort(function(a, b){
                     if (a.savetime > b.savetime)
                        return -1;
                    else return 1;
                     })
          res.send(JSON.stringify(items[0]));
        })
      })
    } else {
      res.send("Rossz jelszó");
    }
});

var listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});
