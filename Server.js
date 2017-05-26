//Stackdriver Debug Enable
require('@google-cloud/debug-agent').start();

var express = require('express');
var mysql = require('mysql');
//var google = require('googleapis');
//var app = express();

const app = express();
//express app needs 'trust proxy' when running in GCP, I think.
//app.enable('trust proxy');

//Get MySQL connection info from environment variables
var config = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

//Check environment variables to debug accuracy
/*
console.log("Environment Variables: " + process.env.MYSQL_USER + " / " +
  process.env.MYSQL_PASSWORD + " / " + process.env.MYSQL_DATABASE); */

if (process.env.INSTANCE_CONNECTION_NAME) {
  config.socketPath = `/cloudsql/${process.env.INSTANCE_CONNECTION_NAME}`;
}
// Connect to the database
const connection = mysql.createConnection(config);

app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/JS'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  res.render('index.html');
});

app.get('/search', function(req, res) {
  connection.query('SELECT name from products where name like "%' + req.query
    .key + '%"',
    function(err, rows, fields) {
      if (err) throw err;
      var data = [];
      var i = 0;
      for (i = 0; i < rows.length; i++) {
        data.push(rows[i].name);
      }
      res.end(JSON.stringify(data));
    });
});

// GCP and localhost compatible multi-purpose way to start Server
const server = app.listen(process.env.PORT || 8081, () => {
  const port = server.address().port;
  console.log(`App listening on port ${port}`);
}); // >>> To start your app (1) Deploy it: "gcloud app deploy" then (2) "gcloud app browse'

//A simpler more hard coded way of starting server localhost
/*
var server = app.listen(3000, function() {
	console.log("We have started our server on port 3000");
});
 */
