// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
var express = require('express');
var app = express();
var request = require('request');
var bodyParser = require('body-parser');

//https://github.com/GoogleCloudPlatform/nodejs-getting-started/blob/master/5-logging/lib/logging.js
//to set up logging

//https://github.com/xpepermint/socket.io-express-session/blob/master/example/index.js#L4
var Session = require('express-session');
var SessionStore = require('session-file-store')(Session);
var session = Session({store: new SessionStore({path: __dirname+'/tmp/sessions'}), secret: 'pass', resave: true, saveUninitialized: true});

//layout defaults to main, located in the views layout folder
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

var cors = require('cors');
app.use(cors());

app.use(express.static(__dirname + '/public'));
//tells application that we are using body parser and to include the middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session);


//sets the template engine to use for the express object
//a template engine will implement the view part of the app
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//https://github.com/expressjs/cors
app.options('*', cors()); // include before other routes

// [START hello_world]
// Say hello!
app.post('/callAPI', function (req, res, next) {       

    	var url = req.body.url;			  
	var max_pages = req.body.max_pages;
	var breadth = req.body.breadth;
	var depth = req.body.depth;
	var keyword = req.body.keyword;    

	//Set the headers
	//http://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express
	var headers = {	
		'Content-Type':     'application/x-www-form-urlencoded',
		'Accept': 'application/json'
	};
	
	var options;
	if(breadth == 'True'){	
	// Configure the request
	//http://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express
		options = {
			url: 'https://web-crawler-api.appspot.com/crawl',
			method: 'POST',
			headers: headers,
			form: {'url': url, 'breadth_pages': max_pages, 'depth': depth, 'keword:': keyword}
		};
	}else{
		// Configure the request
		//http://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express
		var options = {
			url: 'https://web-crawler-api.appspot.com/crawl',
			method: 'POST',
			headers: headers,
			form: {'url': url, 'depth_pages': depth, 'keyword': keyword}
		};

	}
    
    //get graph data from API
    request(options, function(err, response, body){
	
	console.warn("Returning from API: ");      	
	//console.log("body: " + body);
      if (err || response.statusCode < 200 || response.statusCode >= 400) {	
	
      	return res.send({error: 'Something broke trying to call the WebCrawler API...'});
      }else{                  
      	return res.send(body);
	}
	next(err);
    });
  });
// [END hello_world]

//listener all for unrecognized urls
//return 404 not found response
app.use(function(req, res, next){
  res.status(404);
  res.render('404');
});

//listener for errors generate on server
//return 500 response
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});


if (module === require.main) {
  // [START server]
  // Start the server
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
  // [END server]
}

module.exports = app;
