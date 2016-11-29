/******************************************************************************************************* * 
 * File attempts to deal only with manipulating cytoscape graph elements and styles
 */

var cy = null
var root;

//https://codepen.io/yeoupooh/pen/RrBdeZ
//style for node color and selected color
var nodeOptions = {
	normal: {
		bgColorNode: '#006600',
		bgColorEdge: '#D2B48C',
		bgColorNodeEnd: '#669999'
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
		minZoom: 0.01,
		maxZoom: 5000,
		wheelSensitivity: 0.1,
		boxSelectionEnabled: false,
		autounselectify: false,
		boxSelectionEnabled: true,			
		layout: {
			name: 'grid',						
			fit: false,
			columns: 2,
			avoidOverlap: true,
			avoidOverlapPadding: 10
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
				'label': 'data(name)',						
				'font-size': 8,
				'background-color': nodeOptions.normal.bgColorNode,						
				'text-opacity': 0.5,
				//'text-valign': 'center',
				'color': 'black',						  
				'text-outline-width': 0.1,
				'text-outline-color': '#222',
				'min-zoomed-font-size': 10,
				'border-opacity': 0.0					
			})			
			.selector( 'node:selected').css({
				'border-opacity': 0.5,					
				'border-width': 5,
				'border-style': 'solid',
				'border-color': nodeOptions.selected.bgColor,
			})
			.selector( 'edge:selected').css({					
				'line-color': nodeOptions.selected.bgColor,
				'target-arrow-color': nodeOptions.selected.arrowTarget,
				'source-arrow-color': nodeOptions.selected.arrowSource,								
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
addNodesToGraphAsLine = function(size){
	for (var i = 0; i < size; i++) {
		cy.add({
			data: { 
				id: 'node' + i, 
				url: "http://js.cytoscape.org/",
				name: 'node' + i
			}
		});
		var source = 'node' + i;			
		
		if(i > 0){
			var myTar = i;				
			cy.add({
				data: {
					id: 'edge' + i,
					source: 'node' + (i-1),
					target: 'node' + myTar
				}
			});
		}			
	}			
};	

//This is for testing
addNodesToGraphAsTree = function(size){
	var node;
	var colors = gradient(nodeOptions.normal.bgColorNode, nodeOptions.normal.bgColorNodeEnd, size);
	for (var i = 0; i < size; ++i) {
		node = addATestNode(i, colors[i]);

		if(i == 0){
			setRoot(node);
		}											
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

addATestNode = function(i, color){
	var node = {
		data: { 
			id: 'node' + i, 
			url: "http://js.cytoscape.org/",	
			name: 'node' + i
		}			
	}

	cy.add(node).css({'background-color': color});;
	return node;
};

addANode = function(i, myUrl, name, color){
	var node = {
		data: { 
			id: i, 
			url: myUrl,				
			name: name
		}
	}

	cy.add(node).css({ 'background-color': color });

	return node;
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

setRoot = function(node){
	root = node;
};

getRoot = function(){
	return root;
};	

/****************************************************************************************************
* Returns an array of gradient colors from start color to end color
* http://stackoverflow.com/questions/12934720/how-to-increment-decrement-hex-color-values-with-javascript-jquery
* 
*/
function gradient(startColor, endColor, steps) {
	var start = {
    		'Hex'   : startColor,
     		'R'     : parseInt(startColor.slice(1,3), 16),
     		'G'     : parseInt(startColor.slice(3,5), 16),
      		'B'     : parseInt(startColor.slice(5,7), 16)
	}
	var end = {
              	'Hex'   : endColor,
               	'R'     : parseInt(endColor.slice(1,3), 16),
          	'G'     : parseInt(endColor.slice(3,5), 16),
        	'B'     : parseInt(endColor.slice(5,7), 16)
	}
     	diffR = end['R'] - start['R'];
     	diffG = end['G'] - start['G'];
       	diffB = end['B'] - start['B'];

   	stepsHex  = new Array();
    	stepsR    = new Array();
     	stepsG    = new Array();
      	stepsB    = new Array();

     	for(var i = 0; i <= steps; i++) {
                stepsR[i] = start['R'] + ((diffR / steps) * i);
                stepsG[i] = start['G'] + ((diffG / steps) * i);
                stepsB[i] = start['B'] + ((diffB / steps) * i);
        	stepsHex[i] = '#' + Math.round(stepsR[i]).toString(16) + '' + Math.round(stepsG[i]).toString(16) + '' + Math.round(stepsB[i]).toString(16);
	}
	return stepsHex;
} 	
