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
var routerFind = express.Router();

// Middleware for all requests
router.use(function(req, res, next) {
  req.data = req.url.slice(1);
  req.url ='/';
  next();
});

//landing page route

app.use('/', express.static(path.join(__dirname, 'public')));


router.route('/')

  //create a new url
  .get(function(req, res) {

      //http://stackoverflow.com/questions/8188645/javascript-regex-to-match-a-url-in-a-field-of-text
      var urlPattern = new RegExp("(http|ftp|https)://[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?")
      var url = new Url();

      if (urlPattern.test(req.data)) {
        url.original_url = req.data;
        console.log(req.data);
        url.short_url_code = Math.random().toString(36).substr(2, 5);
        url.short_url = 'https://gj-url-shortener.herokuapp.com/find/' + url.short_url_code;

        url.save(function(err) {
          if (err) {res.send(err)};
          res.json({ original_url: url.original_url, short_url: url.short_url, short_url_code: url.short_url_code });
        });
      }
      else {
        res.json({ message: "Please enter a valid url" });
      }

  });

  routerFind.route('/:short_url')
    //create a new url
    .get(function(req, res) {
      Url.find( { short_url_code: req.params.short_url }, function(err, url) {
        if (err) {res.send(err)};
        res.redirect(url[0].original_url);
      });

    });


// Register Routes
app.use('/new', router);
app.use('/find', routerFind);

// Start Server
app.listen(port);
console.log('Listening on ' + port);
