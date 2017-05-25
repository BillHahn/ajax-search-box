var express = require('express');
var mysql = require('mysql');
//var google = require('googleapis');
//var app = express();

//express app needs 'trust proxy' when running in GCP, I think.
const app = express();
app.enable('trust proxy');

//Auth for MySQL Access via GoogleAPI
//I Think the following is for remote apps, but not sure.
/*
	google.auth.getApplicationDefault(function(err, authClient) {
		if (err) {
    	  //return cb(err);
    }});
*/

//Simple style not using environment variables in local, cmdline or app.yaml 
/*
var connection = mysql.createConnection({
	host: '35.184.135.20',
	user: 'root',
	password: 'gcp2@cloud',
	database: 'prodcat'
	
});
connection.connect();
*/

//Get MySQL connection info from environment variables
var config = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

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

// GCP version of Start Server
const server = app.listen(process.env.PORT || 8081, () => {
			const port = server.address().port;
			console.log(`App listening on port ${port}`);
}); // >>> To start your app (1) Deploy it: "gcloud app deploy" then (2) "gcloud app browse'
//Non-GCP way of starting server locally on localhost
/*
var server = app.listen(3000, function() {
	console.log("We have started our server on port 3000");
});
 */