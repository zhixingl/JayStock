// seller1.js
var http = require('http'),
	util = require('util'),
    eyes = require('eyes'),
    xml2js = require('xml2js');

var StockCalculator = require('../stockcalculator.js');
var StockDao = require('../model/stockdao.js');
var azure = require('azure');   

module.exports = Seller1;

function Seller1(){
	var agent = http.globalAgent;
	agent.maxSockets = 50;
	agent.on('connect', function() {
	  	util.log('Socket: ' + agent.sockets.length + '/' + agent.maxSockets +  ' queued: '+ agent.queue.length);
	});
}

Seller1.prototype.run = function(){

	processAllBoughtItems();
	//setTimeout(this.run, 30*60*1000);

	util.log('Seller1 is running......');
};

function processAllBoughtItems(){
	var buyTableName = 'BuyStocks'
		, sellTableName1 = 'SellStocks1';
	  	// , partitionKey = 'StockPartition'
	  	// , accountName = 'zxnodestorage'
	  	// , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

	var urlTemplate = 'http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=%s&scale=30&datalen=25';
	
	var buyStockDao = new StockDao(buyTableName);

	var sellStockDao = new StockDao(sellTableName1);

	buyStockDao.getAllItems(function(error, entities){
		if(error){
			util.log(error);
		}else{
			entities.forEach(function(stock){
				//var stockCode = stock.code;
				var url = util.format(urlTemplate, stock.code);
				//util.log('url = ' + url);
				sendSell1Request(buyStockDao, sellStockDao, stock, url);
				//util.log(item.code);
			});
		}
	});

}


function sendSell1Request(buyStockDao, sellStockDao, stock, url){
	//util.log(url);
	util.log('sendSell1Request: ' + stock.code);
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
						if(items != undefined && items.length == 25){
							sellStockDao.getRealData(stock.code, function(err, realData){
								if(err){
									util.log(err);
								}else{
									var realPrice = parseFloat(realData[3]).toFixed(2);
									var calculator = new StockCalculator(items);
									var ema5 = calculator.EMA(5);
										// util.log('output the conditions: SELL1, SELL2, realPrice < ema5');
									var sell1 = calculator.SELL1();
									var sell2 = calculator.SELL2();

									util.log('realPrice = ' + realPrice + ', ema5= ' + ema5);
									util.log('sell1 = ' + sell1 + ', sell2 = ' + sell2 + ', real<ema5: ' + (realPrice < ema5));
									if(
										sell1 == 50|| sell1 == 50 ||
										realPrice < ema5){
									//if(stock.code == 'sh600028'){
										util.log('Start to sell this stock: ' + stock.code);
										stock.sellPrice = realPrice;
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