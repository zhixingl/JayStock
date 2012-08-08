//parent.js
var cp = require('child_process');

var n = cp.fork('./child.js');


//n.send('message', {msg: 'How are you?'});