//child.js
//var process;
var i = 0;
console.log('start...');



// process.send({ foo: 'bar' });
// process.send('message', {count:10});


setInterval(function(){
	//i ++;
	console.log('Value in child: ' + i++);
	//process.send('message', {count:i++});
	if(i == 15){
		process.exit(0);
	}
}, 5000);
