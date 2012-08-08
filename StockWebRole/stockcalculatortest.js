var StockCalculator = require('./stockcalculator.js');
var http = require('http');
var xml2js = require('xml2js');
var eyes = require('eyes');



var url = 'http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=sh600077&scale=30&datalen=144';
console.log(url);
http.get(url, function(res){
	var resData = '';
	if(res.statusCode == 200){
		res.on('data', function (chunk) {
			resData += chunk;
		});

		res.on('end', function(){
			var parser = new xml2js.Parser();
			parser.on('end', function(result) {					
				var items = result.item;
				//eyes.inspect(items.length);
				
				if(items != undefined && items.length >0){
					var length = items.length;
					
					var calculator = new StockCalculator(items);

					console.log("get the EMA values");

					eyes.inspect(calculator.EMA(5));
					eyes.inspect(calculator.EMA(12));
					eyes.inspect(calculator.EMA(50));
					eyes.inspect(calculator.EMA(89));
					eyes.inspect(calculator.EMA(144));
					/*
					console.log("get the MA0 values");
					
					eyes.inspect(calculator.MA0(items[length - 1]));
					eyes.inspect(calculator.MA0(items[length - 2]));

					console.log("get the MA1 values");
					//eyes.inspect(calculator.MA1());
					
					eyes.inspect(calculator.MA1(items[length - 1]));
					eyes.inspect(calculator.MA1(items[length - 2]));
					eyes.inspect(calculator.MA1(items[length - 3]));
					eyes.inspect(calculator.MA1(items[length - 4]));
					eyes.inspect(calculator.MA1(items[length - 5]));
					eyes.inspect(calculator.MA1(items[length - 6]));
					eyes.inspect(calculator.MA1(items[length - 7]));
					eyes.inspect(calculator.MA1(items[length - 8]));
					eyes.inspect(calculator.MA1(items[length - 9]));
					eyes.inspect(calculator.MA1(items[length - 10]));
					eyes.inspect(calculator.MA1(items[length - 11]));
					eyes.inspect(calculator.MA1(items[length - 12]));
					eyes.inspect(calculator.MA1(items[length - 13]));
					eyes.inspect(calculator.MA1(items[length - 14]));



					console.log("get the MA2 values");
					eyes.inspect(calculator.MA2(items));
					eyes.inspect(calculator.MA2(items.slice(0, -1)));
					eyes.inspect(calculator.MA2(items.slice(0, -2)));
					eyes.inspect(calculator.MA2(items.slice(0, -3)));
					eyes.inspect(calculator.MA2(items.slice(0, -4)));
					eyes.inspect(calculator.MA2(items.slice(0, -5)));
					eyes.inspect(calculator.MA2(items.slice(0, -6)));
					eyes.inspect(calculator.MA2(items.slice(0, -7)));
					eyes.inspect(calculator.MA2(items.slice(0, -8)));
					eyes.inspect(calculator.MA2(items.slice(0, -9)));

					
					//eyes.inspect(calculator.MA2());
					
					console.log("get the MA3 values");
					//eyes.inspect(calculator.MA3());
					eyes.inspect(calculator.MA3(items));
					eyes.inspect(calculator.MA3(items.slice(0, -1)));
					eyes.inspect(calculator.MA3(items.slice(0, -2)));
					eyes.inspect(calculator.MA3(items.slice(0, -3)));
					eyes.inspect(calculator.MA3(items.slice(0, -4)));


					console.log("get the MA4 values");
					eyes.inspect(calculator.MA4(items));
					eyes.inspect(calculator.MA4(items.slice(0, -1)));
					eyes.inspect(calculator.MA4(items.slice(0, -2)));
					eyes.inspect(calculator.MA4(items.slice(0, -3)));
					eyes.inspect(calculator.MA4(items.slice(0, -4)));

					console.log("get the BUY1 value");
					eyes.inspect(calculator.BUY1());
					console.log("get the BUY2 value");
					eyes.inspect(calculator.BUY2());
					console.log("get the SELL1 value");
					eyes.inspect(calculator.SELL1());
					console.log("get the SELL2 value");
					eyes.inspect(calculator.SELL2());
					
					for(var i = 1; i < 10; i ++){
						var calculator = new StockCalculator(items.slice(0, -i));
						eyes.inspect('MA0= ' + calculator.MA0());
						eyes.inspect('MA3= ' + calculator.MA3());
						eyes.inspect('MA4= ' +calculator.MA4());
						console.log('-------------------------------');

					}
					
					*/
				}else{
					//console.log('This stock %s does not exist!', code);
				}
			});
			//console.log(resData);
			parser.parseString(resData);	
		});
	}

	res.on('error', function(err){
		eyes.inspect(err);
	});
});