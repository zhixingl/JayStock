var http = require('http'),
	util = require('util'),
    eyes = require('eyes'),
    azure = require('azure'),
    xml2js = require('xml2js');


var StockCalculator = require('./stockcalculator.js');
var StockDao = require('./model/stockdao.js');
var Buyer = require('./workers/buyer');
var Seller1 = require('./workers/seller1') ;
var Seller2 = require('./workers/seller2');

//var urlTemplate = 'http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=%s&scale=30&datalen=144';

/*
600000 - 600999
601000 - 601999
000000 - 000999
002000 - 002694
*/
module.exports.start = function(){
	var buyer = new Buyer();
	buyer.run();
	var seller1 = new Seller1();
	seller1.run();
	var seller2 = new Seller2();
	seller2.run();

	setInterval(buyer.run, 15*60*1000);
	setInterval(seller1.run, 10*60*1000);
	setInterval(seller2.run, 10*60*1000);
}

/*
function Buyer(){
}

Buyer.prototype.run = function(){
	//Get the data from Sina.com.cn, and send the result to the Parser
	//var urlTemplate = 'http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=sh600000&scale=30&datalen=144';

	//var stockCode = 'sh600000';
	var urlTemplate = 'http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=%s&scale=30&datalen=144';
	var url;
	var stockCode;

	//Buy new 
	for(var count = 0; count < 2000; count++){
		stockCode = 'sh' + (600000 + count);
		url = util.format(urlTemplate, stockCode);
		sendBuyRequest(stockCode, url);
	}	

	for(count = 1; count < 1000; count ++){
		stockCode = 'sz0' + (100000 + count).toString().substring(1);
		//util.log(stockCode);
		url = util.format(urlTemplate, stockCode);
		sendBuyRequest(stockCode, url);
	}

	for(count = 1; count < 695; count ++){
		stockCode = 'sz0' + (102000 + count).toString().substring(1);
		//util.log(stockCode);
		url = util.format(urlTemplate, stockCode);
		sendBuyRequest(stockCode, url);
	}	

	setTimeout(this.run, 30*60*1000);
	util.log('Buyer is running....');
}

function sendBuyRequest(code, url){
	util.log('sendBuyRequest: ' + code);
	http.get(url, function(res) {
		 //util.log("Got response: " + res.statusCode);
		 //util.log(url);		 
		 if(res.statusCode == 200){
		  	var resData = '';
				res.on('data', function (chunk) {
			    resData += chunk;
			    //util.log(chunk);
				});

				res.on('end', function(){
					//eyes.inspect(resData);
					var parser = new xml2js.Parser();
					parser.on('end', function(result) {
						  //eyes.inspect(result.item[0]);
						  //util.log(result.item);							
							var items = result.item;
							if(items != undefined && items.length == 144){
								//calculate the bandwidth
								var band = getBandwidth(items);
								band.stockId = code;								
								//eyes.inspect(band);
								//If meets the below 3 conditions, buy it
								var condition1 = (band.ma50 > band.ma144)
																	&&(band.bandwidth < (band.close - band.preLow))
																	&& (band.bandwidth / band.close < 0.03)
																	&& (band.close > band.open)
																	&& (band.close > band.maxBandwidth);
								var condition2 = (band.volume / band.prevolume) >= 1.9;
								var condition3 = band.purevolume > 0;
								//eyes.inspect([condition1, condition2, condition3]);
								if(condition1 && condition2 && condition3){
									buyStock({
										code: code,
										buyDate: Date.now(),
										buyPrice: band.close.toFixed(2),
										buyVolume: 1000
									});
								}else{
									//util.log(code);
								}
							}else{
								//util.log('This stock %s does not exist!', code);
							}
					});
					parser.parseString(resData);					
				});
			}	
	});
}

function getBandwidth(items){
	var bandwidth = 0,		//带宽 = 5条均线最大差值
			close = 0,				//收盘价
			preLow = 0,				//前一最小值
			open = 0,					//当天开盘
			maxBandwidth = 0,	//最大带宽，即5条均线的最大值
			growth = 0,				//当天涨幅
			volume = 0,				//当天成交量
			prevolume = 0,		//前一日成交量
			purevolume = 0,		//最近20日净成交量
			ma5 = 0,					//5日线价格
			ma12 = 0,					//12日线价格
			ma50 = 0,					//50日线价格
			ma89 = 0,					//89日线价格
			ma144 = 0;					//144日线价格
	var length = items.length;
	var todayItem = items[length - 1];
	var preItem = items[length - 2];
	close = parseFloat(todayItem.close);
	preLow = parseFloat(preItem.low);
	open = parseFloat(todayItem.open);
	growth = (parseFloat(todayItem.close) - parseFloat(preItem.close)) / parseFloat(preItem.close);
	volume = parseInt(todayItem.volume);
	prevolume = parseInt(preItem.volume);		
	// var sumMa5, sumMa12, sumMa50, sumMa89, sumMa144;
	// var sumPurevolume;
	//var length = items.length;
	for(var i = length-1; i >= 0; i--){
			item = items[i];
			if(i >= length - 5){
				ma5 += item.close/5;
				//eyes.inspect([item.close, item.day, ma5]);
				//eyes.inspect(ma5);
			}
			if(i >= length - 12){
				ma12 += item.close/12;
			}
			if(i >= length - 50){
				ma50 += item.close/50;
			}
			if(i >= length - 89){
				ma89 += item.close/89;
			}				
			ma144 += item.close/144;
			if(i >= length - 20){
				//eyes.inspect(purevolume);
				if(item.close > items[i-1].close)
					purevolume += parseInt(item.volume);
				else
					purevolume -= parseInt(item.volume);	
			}				
	}
	//debugger;
	var max = Math.max(ma5, ma12, ma50, ma89, ma144);
	var min = Math.min(ma5, ma12, ma50, ma89, ma144);
	bandwidth = max - min;
	maxBandwidth = max;
	return {
		bandwidth: bandwidth,
		close: close,
		preLow: preLow,
		open: open,
		maxBandwidth: maxBandwidth,
		growth: growth,
		volume: volume,
		prevolume: prevolume,
		purevolume: purevolume,
		ma5: ma5,
		ma12: ma12,
		ma50: ma50,
		ma89: ma89,
		ma144: ma144
	};
}

function buyStock(stock){
	//eyes.inspect(stock);
	util.log('Start buy stock of ' + stock.code);
	var tableName = 'BuyStocks'
  , partitionKey = 'StockPartition'
  , accountName = 'zxnodestorage'
  , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

	var buyStockDao = new StockDao(azure.createTableService(accountName, accountKey)
																	, tableName
																	, partitionKey);

	//If the record doesn't exist, insert it
	buyStockDao.getItem(stock.code, function(error, entity){
		if(error){
			//util.log(error.code);
		}else if(entity){	//No error and entity isn't null
			util.log('The stock of ' + stock.code + ' has existed, stop adding...');
			return;
		}

		//Now let's insert the new record
		buyStockDao.newItem(stock, function(error){
			if(error){
				util.log('Cannot insert new stock item with code ' + stock.code + ', the error code is ' + error.code);
			}else{
				util.log('Insert new stock item successfully, and the code is ' + stock.code );
			}
		});

	});

}


function Seller1(){}

Seller1.prototype.run = function(){
	//var stockCode = 'sh600000';
	//var url;
	//var stockCode;

	processAllBoughtItems();
	setTimeout(this.run, 30*60*1000);

	util.log('Seller1 is running......');
};

function Seller2(){}
Seller2.prototype.run = function(){
	processAllSell1Items();
	setTimeout(this.run, 30*60*1000);

	util.log('Seller2 is running......');
};

function processAllBoughtItems(){
	var buyTableName = 'BuyStocks'
	, sellTableName1 = 'SellStocks1'
  , partitionKey = 'StockPartition'
  , accountName = 'zxnodestorage'
  , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

	var urlTemplate = 'http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=%s&scale=30&datalen=25';
	
	var buyStockDao = new StockDao(azure.createTableService(accountName, accountKey)
																	, buyTableName
																	, partitionKey);

	var sellStockDao = new StockDao(azure.createTableService(accountName, accountKey)
																	, sellTableName1
																	, partitionKey);

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

function processAllSell1Items(){
	var buyTableName = 'SellStocks1'
	, sellTableName1 = 'SellStocks2'
  , partitionKey = 'StockPartition'
  , accountName = 'zxnodestorage'
  , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

	var urlTemplate = 'http://money.finance.sina.com.cn/quotes_service/api/xml.php/CN_MarketData.getKLineData?symbol=%s&scale=30&datalen=12';
	
	var buyStockDao = new StockDao(azure.createTableService(accountName, accountKey)
																	, buyTableName
																	, partitionKey);

	var sellStockDao = new StockDao(azure.createTableService(accountName, accountKey)
																	, sellTableName1
																	, partitionKey);

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
							
							//util.log(stock.code + ': ema5 = ' + ema5);
							sellStockDao.getRealData(stock.code, function(err, realData){
								if(err){
									throw err;
								}else{
									var realPrice = parseFloat(realData[3]).toFixed(2);
									var calculator = new StockCalculator(items);
									var ema5 = calculator.EMA(5);
									 util.log('output the conditions: SELL1, SELL2, realPrice < ema5');
									 eyes.inspect(calculator.SELL1());
									 eyes.inspect(calculator.SELL2());
									 eyes.inspect(realPrice < ema5);
									 util.log('readPrice = ' + realPrice + ', ema5= ' + ema5);

									if(
										calculator.SELL1() == 50|| calculator.SELL2() == 50 ||
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
							var calculator = new StockCalculator(items);
							ema12 = calculator.EMA(12);
							//util.log(stock.code + ': ema12 = ' + ema12);
							sellStockDao.getRealData(stock.code, function(err, realData){
								if(err){
									throw err;
								}else{
									var realPrice = parseFloat(realData[3]).toFixed(2);

									if(realPrice < ema12){
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






function EMA(items, n){
	if(n == 1){
		return parseFloat(items[0].close);
	}else{
		var todayClose = parseFloat(items[n-1].close);
		//[2*X+(N-1)*Y’]/(N+1)，
		return (2*todayClose + (n-1) * EMA(items, n-1))/(n+1);
	}
}

*/








