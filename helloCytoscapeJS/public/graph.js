/******************************************************************************************************* * 
 * File attempts to deal only with manipulating cytoscape graph elements and styles
 */

var cy = null

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
	for (var i = 0; i < 10; ++i) {
		addANode(i);											
	}	
	
	var nodes = cy.nodes();	
	
	//array heap representation 
	for (var i = 0; i < ((nodes.length - 1)/2); ++i) {			
		
		var start = nodes[i].data('id');
		var index1 = 2*i+1;				
		var leftChild =  nodes[index1].data('id');
		addEdge(index1, start, leftChild);			
		
		var index2 = 2*i+2;				
		if(index2 < nodes.length){
			var rightChild =  nodes[index2].data('id');			
			addEdge(index2, start, rightChild);			
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

addANode = function(i, myUrl){
	cy.add({
		data: { 
			id: 'node' + i, 
			url: myUrl,				
		}
	});
};

addEdge = function(i, start, target){
	cy.add({
		data: {
			id: 'edge' + i,
			source: start,
			target: target
		}
	});				
};

	
