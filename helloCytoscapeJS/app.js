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

var session = Session({store: new SessionStore({
	path: __dirname+'/tmp/sessions'}), 
	secret: process.env.PWD + process.env.USER, 
	resave: true, 
	saveUninitialized: true,
	signed: true,
	duration: (7 * 24 * 3600 * 1000),
	activeDuration: (1 * 24 * 3600 * 1000)
});

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

// Request proxy server make a web crawl request
app.post('/callAPI', function (req, res, next) {       

    	var url = req.body.url;			  
	var max_pages = req.body.max_pages;
	var breadth = req.body.breadth;
	var depth = req.body.depth;
	var keyword = req.body.keyword;    
	
	//create urls array and add url to array if needed
	if(req.session){ 
		if(!req.session.urls){
			req.session.urls = {};
			req.session.urls[url] = true;
		}else{
			if(!req.session.urls[url]){
				req.session.urls[url] = true;
			}	
		}
	}

	//Set the headers
	//http://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express
	var headers = {	
		'Content-Type':     'application/x-www-form-urlencoded',
		'Accept': 'application/json'
	};
	
	//http://stackoverflow.com/questions/23925284/how-to-modify-the-nodejs-request-default-timeout-time
	var options;
	if(breadth == 'True'){	
		// Configure the request
		//http://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express
		options = {
			url: 'https://web-crawler-api.appspot.com/crawl',
			method: 'POST',
			headers: headers,
			form: {'url': url, 'breadth_pages': max_pages, 'depth': depth, 'keyword:': keyword},
			timeout: 3 * 60 * 1000
		};
	}else{
		// Configure the request
		//http://stackoverflow.com/questions/32327858/how-to-send-a-post-request-from-node-js-express
		var options = {
			url: 'https://web-crawler-api.appspot.com/crawl',
			method: 'POST',
			headers: headers,
			form: {'url': url, 'depth_pages': depth, 'keyword': keyword},
			timeout: 3 * 60 * 1000
		};
	}
    
    	//get graph data from API
   	request(options, function(err, response, body){
	
		console.warn("Returning from API: ");      	
		console.log("Returning from API");
      		if (err || response.statusCode < 200 || response.statusCode >= 400) {		
      			return res.status(response.statusCode).send(JSON.stringify(body));
      		}else{	                  		
      			return res.send(body);
		}
    	});
});

app.get('/getCookie', function(req, res, next){
	res.setHeader("content-type", "application/json");
	if(req.session){
		return	res.send(JSON.stringify(req.session.urls));
	}else{
		return res.send(JSON.stringify('No cookie for you'));
	}	
});

// [END hello_world]

//handle errors and return message to client
app.use(function (err, req, res, next) {
  console.error(err.stack);
  return res.status(500).send(JSON.stringify('Something broke! ' + err.stack));
})

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
