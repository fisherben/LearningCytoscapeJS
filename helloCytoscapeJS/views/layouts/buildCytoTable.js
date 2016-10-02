console.log("In buildCytoGraph.js script");
document.addEventListener('DOMContentLoaded', buildGraph);


function buildGraph(){
console.log("In buildGraph function!!!");
	var cy = cytoscape({

	      container: document.getElementById('cy'), // container to render in

	      elements: [ // list of graph elements to start with
		      { // node a
			      data: { id: 'a' }
		      },
		      { // node b
			      data: { id: 'b' }
		      },
		      { // edge ab
			      data: { id: 'ab', source: 'a', target: 'b' }
		      }
	      ],

	      style: [ // the stylesheet for the graph
		      {
			      selector: 'node',
			      style: {
				      'background-color': '#666',
				      'label': 'data(id)'
			      }
		      },

		      {
		      selector: 'edge',
			      style: {
			      'width': 3,
			      'line-color': '#ccc',
			      'target-arrow-color': '#ccc',
			      'target-arrow-shape': 'triangle'
			      }
		      }
	      ],

	      layout: {
		      name: 'grid',
		      rows: 1
	      },
	      // initial viewport state:
	      zoom: 1,
	      pan: { x: 0, y: 0 },

	      // interaction options:
	      minZoom: 1e-50,
	      maxZoom: 1e50,
	      zoomingEnabled: true,
	      userZoomingEnabled: true,
	      panningEnabled: true,
	      userPanningEnabled: true,
	      boxSelectionEnabled: false,
	      selectionType: 'single',
	      touchTapThreshold: 8,
	      desktopTapThreshold: 4,
	      autolock: false,
	      autoungrabify: false,
	      autounselectify: false,
	      // rendering options:
	      headless: false,
	      styleEnabled: true,
	      hideEdgesOnViewport: false,
	      hideLabelsOnViewport: false,
	      textureOnViewport: false,
	      motionBlur: false,
	      motionBlurOpacity: 0.2,
	      wheelSensitivity: 1,
	      pixelRatio: 'auto'
	});     
} 
