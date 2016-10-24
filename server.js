var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Url = require('./models/url');

var db = process.env.MONGOLAB_URI;

mongoose.connect(db);

var conn = mongoose.connection;

conn.on('error', console.error.bind(console, 'connection error:'));

conn.once('open', function() {
  console.log('database connected');
});

app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;

// Set Up Routes
var router = express.Router();

// Middleware for all requests
router.use(function(req, res, next) {
  next();
});

//landing page route

app.use('/', express.static(path.join(__dirname, 'public')));



router.route('/:url_input')

  //create a bear
  .get(function(req, res) {

    var url = new Url();
    url.original_url = req.params.url_input;
    url.short_url = Math.random().toString(36).substr(2, 5);

    url.save(function(err) {
      if (err) {res.send(err)};
      res.json({ original_url: url.original_url, short_url: url.short_url });
    });
  });



// Register Routes
app.use('/api', router);

// Start Server
app.listen(port);
console.log('Listening on ' + port);
