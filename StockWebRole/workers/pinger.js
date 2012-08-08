//pinger.js
var http = require('http'),
	util = require('util');
module.exports.start = function(app, interval){
	setInterval(function(){
		var options = {
		  // host: 'localhost',
		  port: app.address().port || 80,
		  path: '/ping',
		  method: 'GET'
		};
		//console.log('start to send!');
		var req = http.request(options, function(res) { 
		  	res.on('end', function () {
		    	util.log('The ping request has finished with status code %s!', res.statusCode);
		  	});
		});

		req.on('error', function(e) {
		  util.log('problem with ping request: ' + e.message);
		});

		req.end();


	}, interval);

}