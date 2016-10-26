
$( function(){ //onDocument ready  	
	var win;	
	var $body = $('body');//used to show / hide spinner
	var loading = document.getElementById('loading');
	var myLayout;
	var cy;
	
    //https://codepen.io/yeoupooh/pen/RrBdeZ
	//style for node color and selected color
	var nodeOptions = {
		normal: {
			bgColorNode: '#98A148',
			bgColorEdge: '#D2B48C'
		},
		selected: {
			bgColor: '#8B0000 ',
			arrowTarget: 'black',
			arrowSource: 'black'
		}
	};

		
	/****************************************************************************************************
	 * Initialize the cytoscape graph
	 * 
	 */	
	initCytoscape = function(){
		cy = window.cy = cytoscape({
			container: document.getElementById('cy'),
			minZoom: 0.1,
			maxZoom: 1000,
			wheelSensitivity: 0.1,
			boxSelectionEnabled: false,
			autounselectify: false,
			boxSelectionEnabled: true,			
			layout: {
				name: 'grid',
				minDist: 40,				
				fit: false,
				columns: 2,
				avoidOverlap: true,
				avoidOverlapPadding: 80
			},			
			//information on using selector for node edge selections
			//http://jsfiddle.net/xmojmr/rbuj3o9c/2/
			style: cytoscape.stylesheet()			
				
				.selector( 'edge').css({					
					'curve-style': 'bezier',
					'opacity': 0.6,
					'width': 'mapData(strength, 70, 100, 2, 6)',
					'target-arrow-shape': 'triangle',
					'source-arrow-shape': 'circle',
					'line-color': nodeOptions.normal.bgColorEdge,
					'source-arrow-color': 'data(#008000)',
					'target-arrow-color': 'data(#808000)',
					'min-zoomed-font-size': 10					
				})									 
				.selector( 'node').css({					
					'shape': 'hexagon',						
					'label': 'data(id)',						
					'font-size': 8,
					'background-color': nodeOptions.normal.bgColorNode,						
					'text-opacity': 0.5,
					//'text-valign': 'center',
					'color': 'black',						  
					'text-outline-width': 0.1,
					'text-outline-color': '#222',
					'min-zoomed-font-size': 10					
				})			
				.selector( ':selected').css({					
					'background-color': nodeOptions.selected.bgColor,
					'line-color': nodeOptions.selected.bgColor,
					'target-arrow-color': nodeOptions.selected.arrowTarget,
					'source-arrow-color': nodeOptions.selected.arrowSource								
				})
				.selector( 'edge:selected').css({					
					'width': 5		
				})					
		});
	};
		
	//http://stackoverflow.com/questions/27696950/cytoscape-js-selector-for-edges-attached-to-selected-node
	//https://groups.google.com/forum/#!topic/cytoscape-discuss/4bwFoKOHwcI
	//http://stackoverflow.com/questions/22338245/cytoscape-js-select-all-nodes-in-an-externally-supplied-array
	//recolor the nodes attached to edge selected
	var selectedEdgeHandler = function(evt) {
		var nodes = cy.filter('node'); // a cached copy of nodes
				
				
		nodes.filter('node:selected').unselect();
		 		
		var nodesOnEdge = cy.$('edge:selected').connectedNodes();		
		nodesOnEdge.select();
	}

	
	//This is for testing
	add10MoreNodesToGraph = function(){
		
		console.log('adding 10 more nodes to graph');
		
		var nodes = cy.nodes().length;
		var index;
		for (var i = 0; i < 10; i++) {
			index = (i + nodes);
			
			cy.animate(
			cy.add({
				data: { 
					id: 'node' + index, 
					url: "http://js.cytoscape.org/",
					myNodeColor: 'red'					
				}
			}),{
			  duration: 1000			  
			});
			var source = 'node' + index;			
			
			if(i > 2){
				var myTar = Math.floor((Math.random() * index));				
				cy.add({
					data: {
						id: 'edge' + index,
						source: source,
						target: 'node' + myTar,
						myEdgeColor: '#86B342'
					}
				});
			}			
		}			
	};	
	
	//This is for testing
	addNodesToGraphAsLine = function(){
		for (var i = 0; i < 50; i++) {
			cy.add({
				data: { 
					id: 'node' + i, 
					url: "http://js.cytoscape.org/",				
				}
			});
			var source = 'node' + i;			
			
			if(i > 0){
				var myTar = i;				
				cy.add({
					data: {
						id: 'edge' + i,
						source: 'node' + (i-1),
						target: 'node' + myTar,
					}
				});
			}			
		}			
	};	
	
	//This is for testing
	addNodesToGraphAsTree = function(){
		for (var i = 0; i < 20; ++i) {
			addANode(i);											
		}	
		
		var nodes = cy.nodes();
		console.log('length of nodes: ' + nodes.length);
		for (var i = 0; i < 20; ++i) {	
			if(i < 18){
				var start = nodes[i].data('id');
				var index1 = i+1;				
				var tar1 =  nodes[index1].data('id');
				var index2 = i+2;				
				var tar2 =  nodes[index2].data('id');			
				addTwoEdges(i, start, tar1, tar2);
			}
		}
	};
	
	addANode = function(i){
		cy.add({
			data: { 
				id: 'node' + i, 
				url: "http://js.cytoscape.org/",				
			}
		});
	};
	
	addTwoEdges = function(i, start, tar1, tar2){
		cy.add({
				data: {
					id: 'edge' + i,
					source: start,
					target: tar1
				}
			});
		cy.add({
				data: {
					id: 'edges' + (i),
					source: start,
					target: tar2
				}
			});			
	};

		
	
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
		
		//add listener for click events on the webCrawl submit button
		$('#webCrawlSubmit').on('click', function(){
			
			disablePage();

			var url = $('#setStartURl').val();
			var maxPages = $('#hopLimit').val();
			//http://stackoverflow.com/questions/10534012/check-if-button-is-active
			var breadthSearch = $('#performBreadth').hasClass("active");
			var depthSearch = $('#performDepth').hasClass("active");
			var depth = 3;
			var keyword = $('#keyWord').val();
			
			//console.log("url: " +url+ ", maxPages: " + maxPages + ", breadth: " + breadthSearch + ", depth: " + depth + ", keyword: " + keyword );
			if(url != null && url != "" && maxPages != null && maxPages < 500 && (breadthSearch == true || depthSearch == true) ){				
				postToAPI(url, maxPages, breadthSearch, depth, keyword);
				setTimeout(enablePage(), 60000);
			}else{
				console.log("Post request failed");
				$('#webCrawlModal').modal('hide');
				enablePage();
			}
			
		});
		
		//https://codepen.io/yeoupooh/pen/RrBdeZ
		//add a listener for edge selected events
		cy.on('select', 'edge', selectedEdgeHandler);
		
	};
	
	//set up the postSubmit button to send data to a server
	//via a post request.
	postToAPI = function(vettedUrl, vettedMaxPages, vettedBreadth, vettedDepth, vettedKeyword ){		
		//vars used in post request 
		var postUrl = "https://web-crawler-ikariotikos.appspot.com/";
		
		var postReq = new XMLHttpRequest();
		var payload = {	
			url: vettedUrl,			  
			max_pages: vettedMaxPages,
			breadth: vettedBreadth,
			depth: vettedDepth,
			keyword: vettedKeyword
		};							
		  		
		postReq.open('POST', postUrl, true);
	  
		//anonymous function is a call back function that parses JSON
		//response to a JSON result obj, which is parse again to a 
		//java script object and displayed on page
		postReq.addEventListener('load', function(){
		  
			if(postReq.status >= 200 && postReq.status < 400){
				var response = JSON.parse(postReq.responseText);
				//document.getElementById('resultData').textContent = response.data;
				var dataObj = JSON.parse(response.data);
				//document.getElementById('resultName').textContent = dataObj.name;
				//document.getElementById('resultHeight').textContent = dataObj.height;
				//document.getElementById('resultWeight').textContent = dataObj.weight;
				console.log(JSON.parse(postReq.responseText));
			}
			enablePage();
			$('#webCrawlModal').modal('hide');
			console.log("Post request success");
		});
		  
		postReq.setRequestHeader('Content-Type', 'application/json');
		postReq.send(JSON.stringify(payload));			 
				  
	};
	
	//This calls the overlay and shows the cog spinning
	disablePage = function(){		
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
		
		myLayout = cy.makeLayout({ name: 'cola', maxSimulationTime: 20000, infinite: false, fit: true});
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
				
			
				
	};  
	
	/********************START THE PROGRAM HERE************************************************************/
	initWebPage();
});
