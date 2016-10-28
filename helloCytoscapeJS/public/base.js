/*******************************************************************************************************
 * File is the main entry point into the application.
 * File attempts to deal only with updating html and visualization in browser window
 */

$( function(){ //onDocument ready  	
	var win;	
	var $body = $('body');//used to show / hide spinner
	var loading = document.getElementById('loading');
	var myLayout;		    
		
	
	/****************************************************************************************************
	 * Animate zooming in on a node and then open url in new browser panel
	 * 
	 */
	 panIn = function(target) {
		var animation = cy.animation({
		  fit: {
			eles: target,
			padding: 20
		  },
		  duration: 1000,
		  easing: 'ease',
		  queue: true
		}).play().promise().then(function(){
			console.log("In promise animation complete");
			window.open(target.data('url'));
			//win.location.href = 'www.google.com';
		});		
	  }	

	
	/****************************************************************************************************
	 * Resize the cytoscape graph on window size update
	 * 
	 */
	resize = function() {
		console.log(win.height(), win.innerHeight());
		$("#cy-container").height(win.innerHeight() / 2 ); //set the height of the container to half the window size		
		cy.resize();
		cy.center();		
		
		$(".overlay").height(win.innerHeight());
		$(".overlay").width(win.innerWidth());
	};
	
	/****************************************************************************************************
	 * Set event listeners for the buttons in the applications.
	 * 
	 */
	activateButtons = function(){
		//http://stackoverflow.com/questions/20870671/bootstrap-3-btn-group-lose-active-class-when-click-any-where-on-the-page
		$(".btn-group > .btn").click(function(){
			$(this).addClass("active").siblings().removeClass("active");									
		});
		
		//http://stackoverflow.com/questions/23152716/bootstrap-navbar-make-clicked-tab-to-be-active
		$('.nav.navbar-nav > li').on('click', function(e) {
			$('.nav.navbar-nav > li').removeClass('active');
			$(this).addClass('active');
		});
		
		//add listener for click events on layout buttons
		$('#layoutList li a').on('click', function(){
			
			
			var layout = $(this).attr('data-layout');
			var title = $(this).text();
			
			if(layout != null && layout != ""){	

				myLayout = cy.makeLayout({ name: layout.toString() });
				myLayout.run();	
				$('#graphTitle').text(title + " Layout");
			}else{
				console.log("Problem with layout, check layout buttons procedure");
			}
		});
		
		//add listener for show labels check box
		$('#showLabelsCheck').on('click', function(){			
			
			//http://stackoverflow.com/questions/18377268/checkbox-value-is-always-on
			var isChecked = $(this).is(':checked');
			
			//http://js.cytoscape.org/#cy.style
			if(isChecked){					
				cy.style().selector('node').style({
					  'text-opacity': 0.5
					})
					.selector('edge').style({
					  'text-opacity': 0.5
					})
				  .update(); // update the elements in the graph with the new style
						
			}else{				
				cy.style().selector('node').style({
					  'text-opacity': 0
					})
					.selector('edge').style({
					  'text-opacity': 0
					})
				  .update(); // update the elements in the graph with the new style	
			}						
		});				
		
		//https://codepen.io/yeoupooh/pen/RrBdeZ
		//add a listener for edge selected events
		cy.on('select', 'edge', selectedEdgeHandler);
		
	};			
	
	// Create the XHR object.
	//https://www.html5rocks.com/en/tutorials/cors/
	function createCORSRequest(method, url) {
		var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {
			// XHR for Chrome/Firefox/Opera/Safari.
			xhr.open(method, url, true);
		} else if (typeof XDomainRequest != "undefined") {
			// XDomainRequest for IE.
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			// CORS not supported.
			xhr = null;
		}
		return xhr;
	}
	
	//set up the postSubmit button to send data to a server
	//via a post request.
	//TODO check that CORS is really required and not just when running locally
	postToAPI = function(vettedUrl, vettedMaxPages, vettedBreadth, vettedDepth, vettedKeyword ){		
		//vars used in post request 
		var postUrl = "https://web-crawler-ikariotikos.appspot.com/callAPI";
		
		var postReq = createCORSRequest('POST', postUrl);

		if(!postReq){
			console.log("Can not make CORS request");
			enablePage();
			return;
		}
		var payload =
			"url=" + vettedUrl + "&" +			  
			"max_pages=" + vettedMaxPages + "&" +
			"breadth=" + vettedBreadth + "&" +
			"depth=" + vettedDepth + "&" +
			"keyword=" + vettedKeyword;										
	  
		
		console.log("Payload: " + payload);		
		//anonymous function is a call back function that parses JSON
		//response to a JSON result obj, which is parse again to a 
		//java script object and displayed on page
		postReq.addEventListener('load', function(){
			
			if(postReq.status >= 200 && postReq.status < 400){
				cy.remove('*');//remove all node from graph
				
				var data = JSON.parse(postReq.responseText);
				var i=0;
				for (i=0;i<data.length;i++){
					//http://stackoverflow.com/questions/6268679/best-way-to-get-the-key-of-a-key-value-javascript-object
					var parent = Object.keys(data[0])[0];
					var child = data[0][Object.keys(data[0])[0]];
					
					if(parent != null && i == 0){
						addANode('ROOT', parent);
					}
					if(child != null ){
						addANode(i, child);
					}
					
					if(parent != null && child != null && i == 0){
						addEdge(i, 'node' + 'ROOT', 'node'+i);
					}else{
						addEdge(i, 'node' + (i-1), 'node'+i);
					}
					
					
				}
				cy.makeLayout({ name: 'cola', maxSimulationTime: 5000, infinite: false, fit: true}).run();
				console.log("Success status making post request");
				console.log();
			}else{
				console.log("Error making post request: ");
				console.log(postReq.responseText);
				console.log(JSON.parse(postReq.responseText));
			}
			enablePage();
			$('#webCrawlModal').modal('hide');			
		});
		  
		postReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		postReq.send(payload);			 
		disablePage();		  
	};
	
	//parse a url
	//http://stackoverflow.com/questions/736513/how-do-i-parse-a-url-into-hostname-and-path-in-javascript
	var getLocation = function (href) {
		var match = href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/);
		return match && {
			protocol: match[1],
			host: match[2],
			hostname: match[3],
			port: match[4],
			pathname: match[5],
			search: match[6],
			hash: match[7]
		}
	};
		
	//https://jqueryvalidation.org/jQuery.validator.addMethod/
	//https://jqueryvalidation.org/validate/
	//http://stackoverflow.com/questions/26498899/jquery-validate-custom-error-message-location
	//http://jsfiddle.net/5WMff/
	//http://stackoverflow.com/questions/18315242/validation-of-bootstrap-select-using-jquery-validate-plugin
	validateCrawlForm = function(){										
		
		 $('#webCrawlForm').validate({	
			ignore: [],
			rules: {								
				crawlSearchGroup: {
				  required: true,
				},				
				searchDepthName: {
					required: true,
					searchDepth:true,
					min: 1,
                    max: 700
				},
				maxPagesName: {
					required: true,
					min: 1,
                    max: 700					
				},
				startUrlName: {
					required: true,
					maxlength: 100				
				},
				keyWordName: {
					maxlength: 100
				}
			},				
			messages: {	
				crawlSearchGroup: {
					required:"Must choose a search type from drop down list."					
				},
				searchDepthName: {
					required:"Must choose a search depth."					
				},
				maxPagesName: {
					required:"Must choose max pages to be returned (max {0})."					
				},
				startUrlName: {
					required:"Must choose a valid url."					

				},
				keyWordName: {
					maxlength:"Max length of string is {0} characters."					
				}
			},			
			errorElement : 'div',
			errorLabelContainer: '.errorTxt',
			submitHandler: function(form) {
				console.log("submitting data to API");				
				$('#webCrawlModal').modal('hide');
				var url = $('#setStartURl').val();
				var maxPages = $('#hopLimit').val();
				//http://stackoverflow.com/questions/2230704/jquery-getting-custom-attribute-from-selected-option
				var option = $('select#crawlSearchGroup option:selected').attr('value');
				var depth = $('#searchDepth').val();
				var keyword = $('#keyWord').val();						
				
				var breadthSearch;
				if( option != null && option == 'breadth' ){
					breadthSearch = 'True';
				}else if(option != null){
					breadthSearch = 'False';
				}
				
				console.log("option" + option + ", url: " + url + ", maxPages: " + maxPages + ", breadth: " + breadthSearch + ", depth: " +  depth + ", keyword: " + keyword );
				if(url != null && url != "" && maxPages != null && maxPages < 500 && breadthSearch != null ){				
										
					postToAPI(url, maxPages, breadthSearch, depth, keyword);										
					//setTimeout(enablePage(), 60000);
				}else{
					console.log('in else bad data enabling page');											
				}
				
				return false;				
			}
		});				
						
		$.validator.addMethod("searchDepth", function(value, element) {
									
			var result = true;
			var option = $('select#crawlSearchGroup option:selected').attr('value');
			if(option == 'breadth' && value > 3){result = false;}
			if(option == 'depth' && value > 700){result = false;}
			if(option == null){result = false;}	
			
			return result;
		}, $.validator.format("If Search type is Breadth First max depth is 3"));
		
		$(".selector").validate({
			highlight: function(element, errorClass) {
				$(element).fadeOut(function() {
					$(element).fadeIn();
				});
			}
		});
	}
	
	//This calls the overlay and shows the cog spinning
	disablePage = function(){
		console.log("disabling page");
		$body.addClass('calc');
	};
	
	//Disables the overlay and enables the page
	enablePage = function(){		
		$body.removeClass('calc');
	};

	//https://gist.github.com/maxkfranz/aedff159b0df05ccfaa5
	//method will animate the graph building visualization
	animateGraphBuilding = function(nodes){
						
		var delay = 0;		
		var size = nodes.length;
		var duration = (10000 / size);

		//loop through the list of nodes and:
		//Show the node, then show the edges
		for( var i = 0; i < nodes.length; ++i ){ 
			var currentNode = nodes[i];
			console.log("Iterating through nodes index: " + i);
			(function(currentNode, x){					
				var nextNode = currentNode.connectedEdges(
					function(){
						return this.source().same(currentNode);
					}
				).target();										
				
				if(nextNode != null && x != 0){
					currentNode.delay( delay, function(){
						currentNode.style("visibility", "visible");
						console.log("Delay function, currentNode: " + currentNode.id() + ", nextNode: " + nextNode.id());
					} ).animate({					
								renderedPosition: currentNode.position(),//from this position								
							}, {
								duration: duration,
								complete: function(){
									//nextNode.style("visibility", "visible");
									nextNode.style("visibility", "visible");										
								}
							}										
						);					
				}else{
					//show currentNode after delay
					currentNode.delay( delay, function(){
						currentNode.style("visibility", "visible");
						
					} ).animate({					
								renderedPosition: currentNode.position(),//from this position								
							}, {
								duration: duration,
								complete: function(){
																			
								}
							}										
						);
					console.log("nextNode is null or on first node");
				}
				delay += duration;
			})(currentNode, i);				
		} // end of for	
				
	};
	  
	//https://gist.github.com/maxkfranz/aedff159b0df05ccfaa5
	//method will animate the graph building visualization
	animateGraphBuilding1 = function(nodes){
						
		var delay = 0;		
		var size = nodes.length;
		var duration = (10000 / size);		
		var nextPosition = new Array();
		var positions = new Array();
		
		//loop through the list of nodes and:
		//Move the nodes up to the parents position
		$.each(nodes, function(index, currentNode){
														
			var nextNode = currentNode.connectedEdges(
				function(){
					return this.source().same(currentNode);
				}
			).target();										
			
			if(index == 0){
				nextPosition.push(currentNode.position());
			}
			
			if(nextNode != null){	
				console.log("setting position for " + nextNode.id() + ", position x: " + nextNode.position().x + ", position y: " + nextNode.position().y);
				//save last position	
				positions.push(nextNode.position());
				
				nextPosition.push(nextNode.position());
				//move to parents position
				nextNode.position(nextPosition.shift());						
			}
		});
			/*!!!!!!!unhide nodes!!!!!!!!!!!!!!!!
			var nodes = cy.filter('node'); // a cached copy of nodes			
			nodes.style("visibility", "visible");	

		$.each(nodes, function(index, currentNode){	
				console.log("setting position for " + currentNode.id() + ", position x: " + currentNode.position().x + ", position y: " + currentNode.position().y);			
		});		*/	
		/*
		//loop through the list of nodes and:
		//Show the node, then show the edges
		$.each(nodes, function(index, currentNode){					
				var nextNode = currentNode.connectedEdges(
					function(){
						return this.source().same(currentNode);
					}
				).target();										
				
				if(nextNode != null){
					currentNode.delay( delay, function(){
						currentNode.style("visibility", "visible");
						console.log("Delay function, currentNode: " + currentNode.id() + ", nextNode: " + nextNode.id());
					} ).animate({					
								position: positions.shift(),//from this position
								css: {								
									'z-index': index
								}
							}, {
								duration: duration,
								complete: function(){
									//nextNode.style("visibility", "visible");
									nextNode.style("visibility", "visible");										
								}
							}										
						);					
				}else{
					//show currentNode after delay
					currentNode.delay( delay, function(){
						currentNode.style("visibility", "visible");
						console.log("Delay function, currentNode: " + currentNode.id());
					} ).animate({					
								position: currentNode.position(),//to this position
								css: {								
									'z-index': index								
								}
							}, {
								duration: duration,
								complete: function(){
																			
								}
							}										
						);
					console.log("nextNode is null or on first node");
				}
				delay += duration;
			});		*/								
	};
	  
	/****************************************************************************************************
	/****************************************************************************************************
	 * Initializes the application.
	 * 
	 */
	initWebPage = function() {	
		loading.classList.add('loaded');
		
		console.log("initializing web application");
		win = $(window);

		//https://codepen.io/yeoupooh/pen/RrBdeZ
		win.resize(function() {
			resize();
		});

		setTimeout(resize, 0);						
		initCytoscape();	
		addNodesToGraphAsTree();
		
		cy.on('layoutstart', function (e) {			
		    disablePage();
			var doAnimation = $(showAnimationCheck).is(':checked');
			if(doAnimation){
				//hide nodes
				var nodes = cy.filter('node'); // a cached copy of nodes			
				nodes.style("visibility", "hidden");																	
			}
        });
		
		cy.on('layoutstop', function (e) {
			cy.center();
			cy.fit();
		    enablePage();
			
			var doAnimation = $(showAnimationCheck).is(':checked');
			
			if(doAnimation){				
				var nodes = cy.filter('node'); // a cached copy of nodes			
				animateGraphBuilding(nodes);
			}
					
        });
		
		myLayout = cy.makeLayout({ name: 'cola', maxSimulationTime: 5000, infinite: false, fit: true});
		myLayout.run();		
	
		$('#graphTitle').text('Cola Layout');
		//cy.center();
		//cy.fit(); //optional arg is padding, fitt all elements
		cy.on('tap', 'node', function(event) {
			var target = event.cyTarget;
			cy.nodes().unselect();
			target.select();
			panIn(target);	
		});
		activateButtons();
		validateCrawlForm();
										
	};  
	
	/********************START THE PROGRAM HERE************************************************************/
	initWebPage();
});
