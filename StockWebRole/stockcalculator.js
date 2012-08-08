module.exports = StockCalculator;

/**
* @param {Array}	items	Each item contains close, low, high properties, and the items are ordered by date from old to new
*/
function StockCalculator(items){
	this.items = items;
	//console.log(items);
}


//EXPMA	http://baike.baidu.com/view/1196584.htm
StockCalculator.prototype.EMA = function(n){
		var self = this;
		//console.log(self.items);
		var length = self.items.length;

		return calculateEma(self.items.slice(length - n), n);
	
};

StockCalculator.prototype.MA = function(values, n){
	var length = values.length;
	var result = 0;
	for(var i = length -1; i >= length - n; i--){
		result += values[i] ;
	}

	return result / n;
}

StockCalculator.prototype.MA0 = function(item){
	//debugger;
	if(!item){
		var self = this;
		var length = self.items.length;
		item = self.items[length-1];
	}
	
	return parseFloat(item.close);
};

StockCalculator.prototype.MA1 = function(item){
	if(!item){
		var self = this;
		var length = self.items.length;
		item = self.items[length - 1];
	}
	return (parseFloat(item.low) + parseFloat(item.high) + parseFloat(item.close)) / 3;

};

StockCalculator.prototype.MA2 = function(myItems){
	//debugger;
	if(!myItems){
		var self = this;
		myItems = self.items;
	}

	var item = null;
	var ma1Array = new Array();
	var length = myItems.length;

	for(var i = length -1; i >= length - 5; i--){
		item = myItems[i];
		ma1Array.push(this.MA1(item));
	}
	
	return this.MA(ma1Array, 5);
};

StockCalculator.prototype.MA3 = function(myItems){

	var self = this;
	if(!myItems){
		myItems = self.items;
	}

	var newItems = null;
	var ma2Array = new Array();
	var length = myItems.length;

	
	//debugger;
	for(var i = length ; i > length - 10; i--){
		//item = self.items[i];
		newItems = myItems.slice(0, i);
		ma2Array.push(this.MA2(newItems));
	}
	

	return self.HHV(ma2Array, 10);
};

StockCalculator.prototype.MA4 = function(myItems){
	var self = this;
	if(!myItems){
		myItems = self.items;
	}
	
	var newItems = null;
	var ma2Array = new Array();
	var length = myItems.length;

	for(var i = length; i > length - 10; i--){
		//item = self.items[i];
		newItems = myItems.slice(0, i);

		ma2Array.push(this.MA2(newItems));
	}
	
	return self.LLV(ma2Array, 10);
};

StockCalculator.prototype.BUY1 = function(myItems){
	var self = this;
	if(!myItems){
		myItems = self.items;
	}
	
	var length = myItems.length;
	var newItems = null;

	var ma0, ma4;
	for(var i = length -1; i >= length - 5; i--){
		ma0 = this.MA0(myItems[i]);
		ma4 = this.MA4(myItems.slice(0, i + 1));
		//console.log('i = ' + i + ', ma0 = ' + ma0 + ', ma4 = ' + ma4);
		if(ma0 < ma4){
			return 50;
		}
	}

	return 0;

}

StockCalculator.prototype.BUY2 = function(myItems){
	var self = this;
	if(!myItems){
		myItems = self.items;
	}
	
	var length = myItems.length;
	//var newItems = null;

	var ma0, ma4;
	debugger;
	for(var i = length -1; i >= length - 10; i--){
		
		ma0 = this.MA0(myItems[i]);
		ma4 = this.MA4(myItems.slice(0, i + 1));
		//console.log('i = ' + i + ', ma0 = ' + ma0 + ', ma4 = ' + ma4);
		if(ma0 < ma4){
			return 50;
		}
	}

	return 0;

}

StockCalculator.prototype.SELL1 = function(myItems){
	var self = this;
	if(!myItems){
		myItems = self.items;
	}
	
	var length = myItems.length;
	//var newItems = null;
	//console.log(myItems);
	var ma0, ma3;
	for(var i = length -1; i >= length - 5; i--){
		
		ma0 = this.MA0(myItems[i]);
		ma3 = this.MA3(myItems.slice(0, i + 1));
		//console.log('i = ' + i + ', ma0 = ' + ma0 + ', ma3 = ' + ma3);
		if(ma0 < ma3){
			return 100;
		}
	}

	return 50;

}

StockCalculator.prototype.SELL2 = function(myItems){
	var self = this;
	if(!myItems){
		myItems = self.items;
	}
	
	var length = myItems.length;
	var newItems = null;

	var ma0, ma3;
	for(var i = length -1; i >= length - 10; i--){
		ma0 = this.MA0(myItems[i]);
		ma3 = this.MA3(myItems.slice(i - 14, i));
		//console.log('i = ' + i + ', ma0 = ' + ma0 + ', ma3 = ' + ma3);
		if(ma0 < ma3){
			return 100;
		}
	}

	return 50;

}

/**
* Calculate the max number in n days
*/
StockCalculator.prototype.HHV = function(values, n){
	//debugger;
	var length = values.length;
	var result = 0;
	var temp = 0;
	for(var i = length -1; i >= length - n; i--){
		temp = values[i];
		if(temp > result){
			result = temp;
		}
	}
	return result;
}

/**
* Calculate the min number in n days
*/
StockCalculator.prototype.LLV = function(values, n){
	var length = values.length;
	var result = values[length - 1];
	var temp = 0;
	for(var i = length -2; i >= length - n; i--){
		temp = values[i];
		if(temp < result){
			result = temp;
		}
	}
	return result;
}

StockCalculator.prototype.getBandWidth = function(myItems){
	var self = this;
	if(!myItems){
		myItems = self.items;
	}
	
	
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
	
	var length = myItems.length;
	var todayItem = myItems[length - 1];
	var preItem = myItems[length - 2];
	close = parseFloat(todayItem.close);
	preLow = parseFloat(preItem.low);
	open = parseFloat(todayItem.open);
	growth = (parseFloat(todayItem.close) - parseFloat(preItem.close)) / parseFloat(preItem.close);
	volume = parseInt(todayItem.volume);
	prevolume = parseInt(preItem.volume);		
	
	var item;
	for(var i = length-1; i >= length - 20; i--){
		item = myItems[i];

		if(item.close > myItems[i-1].close)
			purevolume += parseInt(item.volume);
		else
			purevolume -= parseInt(item.volume);	
			
	}

	ma5 = self.EMA(5);
	ma12 = self.EMA(12);
	ma50 = self.EMA(50);
	ma89 = self.EMA(89);
	ma144 = self.EMA(144);

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



function calculateEma(myItems, n){
	var length = myItems.length;
	if(length == 1){
		return parseFloat(myItems[0].close);
	}else{
		var todayClose = parseFloat(myItems[length-1].close);
		//[2*X+(N-1)*Y’]/(N+1)，
		return (2*todayClose + (n-1) * calculateEma(myItems.slice(0, length-1), n))/(n+1);
	}

}