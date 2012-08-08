var StockDao = require('../model/stockdao.js');
var azure = require('azure');   
var async = require('async');
var eyes = require('eyes');
var http = require('http');
/*
 * GET home page.
 */

module.exports = function(app)
{

    // home page
    app.get('/', function(req, res){
        //res.render('index', { title: 'Home Page.  ' });
        res.redirect('/index.html');
        //res.render('index.html');
        //res.json({ 'user': 'Jack' });
    });
    //<tr><td>sh600000</td><td>浦发银行</td><td>2012/07/31</td><td>6.78</td><td>1000</td><td>6.89</td><td>3.0%</td></tr>
    app.get('/retrieveBought', function(req, res){
        //console.log('/retrieveBought');
        var tableName = 'BuyStocks';
          // , partitionKey = 'StockPartition'
          // , accountName = 'zxnodestorage'
          // , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

        var buyStockDao = new StockDao(tableName);


        buyStockDao.getAllItems(function(error, entities){
            //eyes.inspect(error);
            //eyes.inspect(entities);
            //console.log("the length = " + entities.length);
            if(error){
                //res.error(error.code);
                res.json({});
            }else{
                //res.json(entities);
                async.forEach(entities
                    , function(entity, callback){
                        entity.name = entity.code;
                        //now get the current price
                        var realUrl = 'http://hq.sinajs.cn/?list=' + entity.code;
                        http.get(realUrl, function(response) {
                           // eyes.inspect(res);
                            if(response.statusCode == 200){
                                var resData = '';
                                response.on('data', function (chunk) {
                                    resData += chunk;
                                });
                            
                                response.on('end', function(){
                                    eval(resData);
                                    var realData = eval('hq_str_' + entity.code).split(',');
                                    entity.currPrice = parseFloat(realData[3]).toFixed(2);
                                    //console.log( entity.currPrice);
                                    callback(null);
                                });

                                response.on('error', function(err){
                                    callback(err);
                                });
                            }
                        });
                    }
                    , function(error){
                        //console.log('My callback......');
                        if(error){
                            console.log(error);
                        }else{
                            res.setHeader('Cache-Control', 'No-Cache');
                            res.json(entities);
                        }
                    }
                );
            }            
        });
        //console.log(myArray);
        //res.json(myArray);
    });

    app.get('/retrieveSold1', function(req, res){
        //console.log('/retrieveBought');
        var sellTableName1 = 'SellStocks1';
          // , partitionKey = 'StockPartition'
          // , accountName = 'zxnodestorage'
          // , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

        var sellStockDao = new StockDao(sellTableName1);


        sellStockDao.getAllItems(function(error, entities){
            //eyes.inspect(error);
            //eyes.inspect(entities);
            //console.log("the length = " + entities.length);
            if(error){
                //res.error(error.code);
                res.json({});
            }else{
                //res.json(entities);
                async.forEach(entities
                    , function(entity, callback){
                        entity.name = entity.code;
                        sellStockDao.getRealData(entity.code, function(err, realData){
                            if(err){
                                callback(err);
                            }else{
                                entity.currPrice = parseFloat(realData[3]).toFixed(2);
                                callback(null);
                            }
                        });
                    }
                    , function(error){
                        //console.log('My callback......');
                        if(error){
                            console.log(error);
                        }else{
                            res.setHeader('Cache-Control', 'No-Cache');
                            res.json(entities);
                        }
                    }
                );
            }            
        });
    });    

    app.get('/retrieveSold2', function(req, res){
        //console.log('/retrieveBought');
        var sellTableName2 = 'SellStocks2';
          // , partitionKey = 'StockPartition'
          // , accountName = 'zxnodestorage'
          // , accountKey = 'g8VByq/98xY0jibr4RVHvN4/4Czxh1tVpIH7OnP9h9KixC4f62SltDGk6OFq8AXuDSGDMOFEXZs3ZWAi98e2Xw==';

        var sellStockDao = new StockDao(sellTableName2);


        sellStockDao.getAllItems(function(error, entities){
            //eyes.inspect(error);
            //eyes.inspect(entities);
            //console.log("the length = " + entities.length);
            if(error){
                //res.error(error.code);
                res.json({});
            }else{
                //res.json(entities);
                async.forEach(entities
                    , function(entity, callback){
                        entity.name = entity.code;
                        sellStockDao.getRealData(entity.code, function(err, realData){
                            if(err){
                                callback(err);
                            }else{
                                entity.currPrice = parseFloat(realData[3]).toFixed(2);
                                callback(null);
                            }
                        });
                    }
                    , function(error){
                        //console.log('My callback......');
                        if(error){
                            console.log(error);
                        }else{
                            res.setHeader('Cache-Control', 'No-Cache');
                            res.json(entities);
                        }
                    }
                );
            }            
        });
    });  

    //ping page
    app.get('/ping', function(req, res){
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(Date.now() + '');
    });

    /*
    // chat area
    app.get('/chat', function(req, res) {
    res.render('chat', { title: 'Chat with Me!  ' })
    });

    // about page
    app.get('/about', function(req, res) {
    res.render('about', { title: 'About Me.  ' })
    });    
    */
}

