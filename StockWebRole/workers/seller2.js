// seller2.js
var http = require('http'),
	util = require('util'),
    eyes = require('eyes'),
    xml2js = require('xml2js');

var StockCalculator = require('../stockcalculator.js');
var StockDao = require('../model/stockdao.js');
var azure = require('azure');   

module.exports = Seller2;

function Seller2(){
	var agent = http.globalAgent;
	agent.maxSockets = 50;
	agent.on('connect', function() {
	  	util.log('Socket: ' + agent.sockets.length + '/' + agent.maxSockets +  ' queued: '+ agent.queue.length);
	});
}

Seller2.prototype.run = function(){
	processAllSell1Items();
	//setTimeout(this.run, 30*60*1000);

	util.log('Seller2 is running......');
};

function processAllSell1Items(){
	var buyTableName = 'SellStocks1'
	, sellTableName2 = 'SellStocks2';
  // , partitionKey = 'StockPartition'
  // , accountName = 'zxnodestorage'
  // , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

	var urlTemplate = 'http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=%s&scale=30&datalen=12';
	
	var buyStockDao = new StockDao(buyTableName);

	var sellStockDao = new StockDao(sellTableName2);

	buyStockDao.getAllItems(function(error, entities){
		if(error){
			util.log(error);
		}else{
			entities.forEach(function(stock){
				//var stockCode = stock.code;
				var url = util.format(urlTemplate, stock.code);
				//util.log('url = ' + url);
				sendSell2Request(buyStockDao, sellStockDao, stock, url);
				//util.log(item.code);
			});
		}
	});

}

function sendSell2Request(buyStockDao, sellStockDao, stock, url){
	//util.log(url);
	util.log('sendSell2Request: ' + stock.code);
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
						//eyes.inspect(items);
						if(items != undefined && items.length == 12){

							//util.log(stock.code + ': ema12 = ' + ema12);
							sellStockDao.getRealData(stock.code, function(err, realData){
								if(err){
									throw err;
								}else{
									var calculator = new StockCalculator(items);
									var ema12 = calculator.EMA(12);
									var realPrice = parseFloat(realData[3]).toFixed(2);
									util.log('Seller2: realPrice = ' + realPrice + ', ema12 = ' + ema12);
									if(realPrice < ema12){
										stock.sellPrice = realPrice;
										util.log('realPrice less than ema12');
										sellStock(buyStockDao, sellStockDao, stock);
									}
								}
							});							
						}else{
							//util.log('This stock %s does not exist!', code);
						}
					});
					//util.log(resData);
					parser.parseString(resData);	
			});
		}else{
			util.log(res.statusCode);
		}
	});
}


function sellStock(buyStockDao, sellStockDao, stock){
	stock.sellDate = Date.now();
	stock.sellVolume = 500;
//Now let's insert the new record
	//eyes.inspect(stock);
	sellStockDao.newItem(stock, function(error){
		if(error){
			util.log('Cannot insert new sell stock item with code ' + stock.code + ', the error code is ' + error.code);
		}else{
			util.log('Insert new sell stock item successfully, and the code is ' + stock.code );
		}
	});

	buyStockDao.removeItem(stock.code, function(err){
		if(err){
			util.log('Cannot remove item');
		}
	});

}