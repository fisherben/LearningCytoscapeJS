**Ben Fisher
**fisheben@oregonstate.edu
**09/27/2016
**CS 496
**Assignment 1
**********************************************************************************/

//handles click events for edits
var eSubmitButton = document.getElementById('eRowSubmit');

//handles click events for adding rows
var submitButton = document.getElementById('rowSubmit');

document.addEventListener('DOMContentLoaded', createTable());

/*********************************************************************************
**Function creates a new sql table on the server
**********************************************************************************/
function createTable(){	
console.log("we're in createTable()");
	var createReq;		
	
	var url = "https://8080-dot-2149350-dot-devshell.appspot.com/"
	
	createReq = new XMLHttpRequest();
	createReq.open("GET", url, true);
			
	createReq.addEventListener('load', function(){						
		var response = JSON.parse( createReq.responseText);
					
		if( createReq.status >= 200 &&  createReq.status < 400){															
			submitButton.addEventListener('click', function(event){	
				lbs = document.getElementById("lbs");				
				event.preventDefault();
			});
		}
	});
			
	createReq.send(null); 
}

