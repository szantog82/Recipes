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

//var uri = "mongodb+srv://mongodb:" + process.env.PASS + "@szantog82.1dmlm.mongodb.net/szantog82?retryWrites=true&w=majority";
var uri = "mongodb://mongodb:" + process.env.PASS + "@szantog82-shard-00-00.1dmlm.mongodb.net:27017,szantog82-shard-00-01.1dmlm.mongodb.net:27017,szantog82-shard-00-02.1dmlm.mongodb.net:27017/szantog82?ssl=true&replicaSet=atlas-zj6i4v-shard-0&authSource=admin&retryWrites=true&w=majority";

var ConnectToDB = function(collectionName){
  mongoose.connect(uri, {
            socketTimeoutMS: 0,
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        var db = mongoose.connection.collection(collectionName);
  return db;
}

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
    var db = ConnectToDB("Recipes");
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
        var db = ConnectToDB("Recipes");
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
    var db = ConnectToDB("WeeklyMenu");
    db.find().sort({
        "time": -1
    }).toArray(function(err2, items) {
        res.send(items[0]);
    })
});

app.get("/getprevmenus", function(req, res) {
    console.log("Fetching weekly menu...");
    var db = ConnectToDB("WeeklyMenu");
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
        var db = ConnectToDB("WeeklyMenu");
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
        upload["incomecategorylist"] = body.incomecategorylist;
        upload["expenditurecategorylist"] = body.expenditurecategorylist;
        upload["repetitivedata"] = body.repetitivedata;
        upload["icons"] = body.icons;
        var d = new Date();
        upload["savetime"] = d.getTime();
        console.log("FinanceBackup is uploading to db...");
        var db = ConnectToDB("FinanceBackup");
        db.remove({username: body.username});                
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
        var username = body.username;
        var db = ConnectToDB("FinanceBackup");
        db.find({username: body.username}, function(err, data) {
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

app.post("/anyaeleszto_upload_backup", function (req, res) {
  var pwd = req.body.password;
  if (pwd == process.env.PWD) {
    var data = req.body.data;
    var body = JSON.parse(data);
    console.log("anyaeleszto upload backup received");
    var upload = {};
    upload["clients"] = body["clients"];
    upload["occassions"] = body["occassions"];
    var d = new Date();
    upload["datetime"] = d.getTime();
    var db = ConnectToDB("Anyaeleszto");
    db.insert(upload);
  }
  res.end();
});

app.post("/anyaeleszto_download_backup", function (req, res) {
  var pwd = req.body.password;
  if (pwd == process.env.PWD) {
    var db = ConnectToDB("Anyaeleszto");
    console.log("anyaeleszto download backup request received");
    db.find({}, function (err, data) {
      data.toArray(function (err2, items) {
        items.sort((a, b) => a.datetime < b.datetime);
        var output = items.slice(0, 3);
        res.send(JSON.stringify(output));
      });
    });
  } else {
    res.end(pwd + " " + process.env.PWD);
  }
});

var listener = app.listen(process.env.PORT, function() {
    console.log('Your app is listening on port ' + listener.address().port);
});
