var azure=require('azure');
var http = require('http');
//var uuid = require('node-uuid');
module.exports = StockDao;

var CONST_PARTITIONKEY = 'StockPartition';
var CONST_ACCOUNTNAME = 'jaystock';
var CONST_ACCOUNTKEY = 'IvJuOAjUw2In2BtdTEnuYgIZSo8rlg0OBV07j7SYEUzqPww7q+bZt+pcqSVUI7RycI9Sw1+GlA2UC3oFmGmXzQ==';


function StockDao (tableName) {
  this.storageClient = azure.createTableService(CONST_ACCOUNTNAME, CONST_ACCOUNTKEY);
  this.partitionKey = CONST_PARTITIONKEY;
  this.tableName = tableName;
  this.storageClient.createTableIfNotExists(tableName, function(err){
    //console.log("tableName = " + tableName);
    if(err){
      //throw err;
      console.log(err);
    }
  });
};


StockDao.prototype = {
    /**
    * Get all the items from table
    * @this {StockDao}
    * @param {function(error, queryEntitiesResult, response)}   callback     The callback function.
    * @return {undefined}
    */
    getAllItems: function (callback) {
      var self = this;
      var query = azure.TableQuery
          .select()
          .from(self.tableName);
          //.where('completed eq ?', 'false');
      self.storageClient.queryEntities(query, function(error, entities){
        sortEntities(entities);
        callback(error, entities);
      });        
    },

    /**
    * Get one item by stock code
    * @this {StockDao}
    * @param {string}       code               The stock code like sh6000000
    * @param {function(error, tableResult, response)}   callback  The callback function
    */
    getItem: function(code, callback){
      var self = this;
      self.storageClient.queryEntity(self.tableName, self.partitionKey, code, callback);

    },

    /**
    * Insert a new stock item into current table
    * @this {StockDao}
    * @param {Object} stock     The stock object
    * @param {function(error, entity, response)}  callback        The callback function.
    */
    newItem: function (stock, callback) {
      var self = this;
      stock.RowKey = stock.code;
      stock.PartitionKey = self.partitionKey;
      //stock.completed = false;
      this.storageClient.insertEntity(self.tableName, stock, callback);
    },

    /**
    * Remove the stock by code
    * @this {StockDao}
    * @param {string}       code               The stock code like sh6000000
    * @param {function(error, successful, response)}  callback      The callback function.
    * @return {undefined}
    */
    removeItem: function(code, callback){
      var self = this;
      var item = {PartitionKey: self.partitionKey, RowKey: code};
      self.storageClient.deleteEntity(self.tableName, item, callback);
    },

    /**
    * Get the real stock data
    * @this {StockDao}
    * @param {string}   code               The stock code like sh6000000
    * @param {function(error, data)}    callback    The callback function
    *
    */
    getRealData: function(code, callback){
      var realUrl = 'http://hq.sinajs.cn/?list=' + code;
      http.get(realUrl, function(response) {
          // eyes.inspect(res);
          if(response.statusCode == 200){
              var resData = '';
              response.on('data', function (chunk) {
                  resData += chunk;
              });
                                          
              response.on('end', function(){
                  eval(resData);
                  var realData = eval('hq_str_' + code).split(',');
                  //entity.currPrice = parseFloat(realData[3]).toFixed(2);
                  //console.log( entity.currPrice);
                  callback(null, realData);
              });
              

          }else{
            callback('Get wrong response code as ' + response.statusCode);
          }

          response.on('error', function(err){
            callback(err);
          });
      });
    },

    /**
    * Delete all data from the table
    * @this {StockDao}
    * @param {string} table   tableName
    * @param {function(error)}  callback    The callback function
    */
    deleteAll: function(table, callback){
      var self = this;
      
      if(!table){
        table = self.tableName;
      }
      

      self.storageClient.deleteTable(table, callback);
    }
};

function sortEntities(entities){
    if(entities == undefined)
      return;
    var length = entities.length;
    var currEntity = null;
    var nextEntity = null;
    var tempEntity = null;

    for(var i = 0; i < length ; i ++){
      for(var j = i + 1; j < length; j++){
        currEntity = entities[i];
        nextEntity = entities[j];
        if(currEntity.buyDate > nextEntity.buyDate){
          //console.log('start swap!')
          tempEntity = currEntity;
          entities[i] = nextEntity
          entities[j] = tempEntity;
        }
      }
    }
}