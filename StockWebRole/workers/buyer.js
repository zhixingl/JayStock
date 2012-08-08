// buyer.js
var http = require('http'),
	util = require('util'),
    eyes = require('eyes'),
    xml2js = require('xml2js');

var StockCalculator = require('../stockcalculator.js');
var StockDao = require('../model/stockdao.js');
var azure = require('azure');   

module.exports = Buyer;

function Buyer(){
	var agent = http.globalAgent;
	agent.maxSockets = 50;
	agent.on('connect', function() {
	  	util.log('Socket: ' + agent.sockets.length + '/' + agent.maxSockets +  ' queued: '+ agent.queue.length);
	});
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

	//setTimeout(this.run, 30*60*1000);
	util.log('Buyer is running....');
}

function sendBuyRequest(code, url){
	//util.log('sendBuyRequest: ' + code);
	http.get(url, function(res) {	 
		 if(res.statusCode == 200){
		  	var resData = '';
				res.on('data', function (chunk) {
			    	resData += chunk;
				});

				res.on('end', function(){
					//util.log('The data retrieve for ' + code + " is finished!");		
					var parser = new xml2js.Parser();
					parser.on('end', function(result) {
							var items = result.item;
							if(items != undefined && items.length == 144){
								var calculator = new StockCalculator(items);
								//calculate the bandwidth
								var band = calculator.getBandWidth();
								band.stockId = code;								
								
								//If meets the below 3 conditions, buy it
								var condition1 = (band.ma50 > band.ma144)
												&&(band.bandwidth < (band.close - band.preLow))
												&& (band.bandwidth / band.close < 0.03)
												&& (band.close > band.open)
												&& (band.close > band.maxBandwidth)
												&& ((band.close - band.maxBandwidth) / band.close < 0.02);
								var condition2 = (band.volume / band.prevolume) >= 1.4;
								// var condition3 = band.purevolume > 0;
								var condition3 = true;
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

/*
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
*/

function buyStock(stock){
	//eyes.inspect(stock);
	util.log('Start buy stock of ' + stock.code);
	var tableName = 'BuyStocks';
  // , partitionKey = 'StockPartition'
  // , accountName = 'zxnodestorage'
  // , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

	var buyStockDao = new StockDao(tableName);

	//If the record doesn't exist, insert it
	buyStockDao.getItem(stock.code, function(error, entity){
		if(error){
			//util.log(error.code);
		}else if(entity){	//No error and entity isn't null
			util.log('The stock of ' + stock.code + ' has existed, stop adding...');
			return;
		}

		//Confirm the stock is still in trading
		buyStockDao.getRealData(stock.code, function(err, realData){
			if(err){
				util.log(err);
			}else{
				if(realData && realData[3]){
					//Now let's insert the new record
					buyStockDao.newItem(stock, function(error){
						if(error){
							util.log('Cannot insert new stock item with code ' + stock.code + ', the error code is ' + error.code);
						}else{
							util.log('Insert new stock item successfully, and the code is ' + stock.code );
						}
					});
				}
										
			}
		});

	});

}
