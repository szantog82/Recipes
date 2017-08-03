
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

var Recipe = mongoose.model('Recipe', recipeSchema);

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
    db.collection('Recipes').insert(upload);
    res.writeHead(301,{Location: '/'});
    res.end();
  }
  else {
    res.send("Rossz jelszó");
  }
});


var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
