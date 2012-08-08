var util = require('util');
var eyes = require('eyes');

//util.log("This is log!");
/*util.error("This is error!");
var str = util.format("THis is number %d", 12);
//util.log(str);
util.log("THis is number %d", 12);
util.log(str);

// eval('var hq_str_sh600000="浦发银行,7.74,7.75,7.74,7.75,7.68,7.73,7.74,44045380,339338689,257412,7.73,264312,7.72,176007,7.71,647818,7.70,522475,7.69,1997949,7.74,954817,7.75,520904,7.76,324170,7.77,421201,7.78,2012-08-03,15:03:04,00"');
// eyes.inspect(eval('hq_str_sh600000').split(','));


console.log(new Date(Date.now()).getUTCHours());
var day = new Date(1344089855510);
eyes.inspect(day);
console.log(day.toLocaleString());
*/

var tester = require('./model/teststockdao.js')();
tester.getAllItems();

// tester.deleteAll(function(err){
// 	eyes.inspect(err);
// });




