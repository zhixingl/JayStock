window.onload=function() {

  // get tab container
  	var container = document.getElementById("tabContainer");
    var tabcon = document.getElementById("tabscontent");
		//alert(tabcon.childNodes.item(1));
    // set current tab
    var navitem = document.getElementById("tabHeader_1");
		
    //store which tab we are on
    var ident = navitem.id.split("_")[1];
	//alert(ident);
    navitem.parentNode.setAttribute("data-current",ident);
    //set current tab with class of activetabheader
    navitem.setAttribute("class","tabActiveHeader");

    //hide two tab contents we don't need
   	var pages = tabcon.getElementsByTagName("div");
    for (var i = 1; i < pages.length; i++) {
     	 pages.item(i).style.display="none";
    };

    //this adds click event to tabs
    var tabs = container.getElementsByTagName("li");
    for (i = 0; i < tabs.length; i++) {
      tabs[i].onclick=displayPage;
    }

    //Initialize the data for the stocks
    initializeData();
}

// on click of one of tabs
function displayPage() {
    var current = this.parentNode.getAttribute("data-current");
    //remove class of activetabheader and hide old contents
    document.getElementById("tabHeader_" + current).removeAttribute("class");
    document.getElementById("tabpage_" + current).style.display="none";

    var ident = this.id.split("_")[1];
    //add class of activetabheader to new active tab and show contents
    this.setAttribute("class","tabActiveHeader");
    document.getElementById("tabpage_" + ident).style.display="block";
    this.parentNode.setAttribute("data-current",ident);
}

function initializeData(){
    if(XMLHttpRequest.DONE == undefined){
        XMLHttpRequest.prototype.DONE = 4;
    }

    retrieveBoughtData();
    retrieveSoldData1();
    retrieveSoldData2();
    setTimeout(initializeData, 30000);
}

function retrieveBoughtData(){
    var tblBought = document.getElementById("tblBought");

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "./retrieveBought", true);
   // xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (xhr.readyState == xhr.DONE) {
        var jsonData = xhr.response;
        if(jsonData == undefined){
            jsonData = xhr.responseText;
        }
        var jsonArray = JSON.parse(jsonData);
        
        var content = "";
        var item;
        var row;
        var cell;
        var tBody = tblBought.tBodies[0];
        //tBody.innerHTML = "";
        clearTbody(tBody);
        for(var i = 0; i < jsonArray.length; i ++){

            item = jsonArray[i];
           // content += "<tr>";
            row =  tBody.insertRow(-1);

            
            content = "";
            content += "<td class='stockcode'>" 
                        + item.code 
                        + "</td>";
            content += "<td>" + item.name + "</td>";
            content += "<td title='" + new Date(parseInt(item.buyDate)).toLocaleString() + "''>" 
                    + new Date(parseInt(item.buyDate)).format('mm/dd/yyyy') + "</td>";
            content += "<td>" + new Date(parseInt(item.buyDate)).format('HH:MM:ss') + "</td>";
            content += "<td>" + item.buyPrice + "</td>";
            content += "<td>" + item.buyVolume + "</td>";
            content += "<td>" + item.currPrice + "</td>";
            content += "<td>" + ((item.currPrice - item.buyPrice) * 100 / item.buyPrice).toFixed(2) + "%</td>";
            
            row.innerHTML = content;
            

            //Javascript code to insert the table contents
/*            cell = row.insertCell(-1);
            cell.setAttribute("class", "stockcode");
            cell.innerText = item.code;

            row.insertCell(-1).innerText = item.name;

            cell = row.insertCell(-1);
            cell.setAttribute("title", new Date(parseInt(item.buyDate)).toLocaleString());
            cell.innerText = new Date(parseInt(item.buyDate)).format('mm/dd/yyyy');

            row.insertCell(-1).innerText = item.buyPrice;
            row.insertCell(-1).innerText = item.buyVolume;
            row.insertCell(-1).innerText = item.currPrice;
            row.insertCell(-1).innerText = ((item.currPrice - item.buyPrice) * 100 / item.buyPrice).toFixed(2) + "%";
*/
            //Javascript code to insert the table contents - finish

            row.firstChild.setAttribute("code", item.code);
            if(row.firstChild.addEventListener){
                row.firstChild.addEventListener("click", function(){
                    var url = "http://finance.sina.com.cn/realstock/company/"
                            + this.getAttribute("code")
                            + "/nc.shtml";
                    window.open(url);
                })
            }else if(row.firstChild.attachEvent){
                row.firstChild.attachEvent("onclick", function(){
                    var myCode = this.event.srcElement.getAttribute("code");
                    var url = "http://finance.sina.com.cn/realstock/company/"
                            + myCode
                            + "/nc.shtml";
                    window.open(url);
                })
            }
            //content +="</tr>\n";
        }

        
      }
    }
    xhr.send();
    
}

function retrieveSoldData1(){
    var tblSold1 = document.getElementById("tblSold1");

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "./retrieveSold1", true);
   // xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (xhr.readyState == xhr.DONE) {
        var jsonData = xhr.response;
        if(jsonData == undefined){
            jsonData = xhr.responseText;
        }
        var jsonArray = JSON.parse(jsonData);
        
        var content = "";
        var item;
        var row;
        var tBody = tblSold1.tBodies[0];
        //tBody.innerHTML = "";
        clearTbody(tBody);
        for(var i = 0; i < jsonArray.length; i ++){
        //var content = "<tr><td>sh600000</td><td>浦发银行</td><td>2012/07/31</td><td>6.78</td><td>1000</td><td>6.89</td><td>3.0%</td></tr>";
        //content += content;
            item = jsonArray[i];
           // content += "<tr>";
            row =  tBody.insertRow(-1);

            content = "";
            content += "<td class='stockcode'>" 
                        + item.code 
                        + "</td>";
            content += "<td>" + item.name + "</td>";
            //content += "<td>" + item.buyDate + "</td>";
            content += "<td title='" + new Date(parseInt(item.buyDate)).toLocaleString() + "''>" 
                    + new Date(parseInt(item.buyDate)).format('mm/dd/yyyy') + "</td>";
            content += "<td>" + new Date(parseInt(item.buyDate)).format('HH:MM:ss') + "</td>";
            content += "<td>" + item.buyPrice + "</td>";
            content += "<td>" + item.buyVolume + "</td>";
            //content += "<td>" + item.sellDate + "</td>";
            content += "<td title='" + new Date(parseInt(item.sellDate)).toLocaleString() + "''>" 
                    + new Date(parseInt(item.sellDate)).format('mm/dd/yyyy') + "</td>";
            content += "<td>" + new Date(parseInt(item.sellDate)).format('HH:MM:ss') + "</td>";
            content += "<td>" + item.sellPrice + "</td>";
            content += "<td>" + item.sellVolume + "</td>";
            content += "<td>" + item.currPrice + "</td>";
            content += "<td>" + ((item.sellPrice - item.buyPrice) * 100 / item.buyPrice).toFixed(2) + "%</td>";
            
            row.innerHTML = content;
            row.firstChild.setAttribute("code", item.code);

            row.firstChild.addEventListener("click", function(){
                var url = "http://finance.sina.com.cn/realstock/company/"
                        + this.getAttribute("code")
                        + "/nc.shtml";
                window.open(url);
            })
            //content +="</tr>\n";
        }

        
      }
    }
    xhr.send();
}


function retrieveSoldData2(){
    var tblSold1 = document.getElementById("tblSold2");

    var xhr = new XMLHttpRequest();
    xhr.open("GET", "./retrieveSold2", true);
   // xhr.responseType = "json";
    xhr.onreadystatechange = function () {
      if (xhr.readyState == xhr.DONE) {
        var jsonData = xhr.response;
        if(jsonData == undefined){
            jsonData = xhr.responseText;
        }
        var jsonArray = JSON.parse(jsonData);
        
        var content = "";
        var item;
        var row;
        var tBody = tblSold1.tBodies[0];
        //tBody.innerHTML = "";
        clearTbody(tBody);
        for(var i = 0; i < jsonArray.length; i ++){
        //var content = "<tr><td>sh600000</td><td>浦发银行</td><td>2012/07/31</td><td>6.78</td><td>1000</td><td>6.89</td><td>3.0%</td></tr>";
        //content += content;
            item = jsonArray[i];
           // content += "<tr>";
            row =  tBody.insertRow(-1);

            content = "";
            content += "<td class='stockcode'>" 
                        + item.code 
                        + "</td>";
            content += "<td>" + item.name + "</td>";
            //content += "<td>" + item.buyDate + "</td>";
            content += "<td title='" + new Date(parseInt(item.buyDate)).toLocaleString() + "''>" 
                    + new Date(parseInt(item.buyDate)).format('mm/dd/yyyy') + "</td>";
            content += "<td>" + new Date(parseInt(item.buyDate)).format('HH:MM:ss') + "</td>";
            content += "<td>" + item.buyPrice + "</td>";
            content += "<td>" + item.buyVolume + "</td>";
            //content += "<td>" + item.sellDate + "</td>";
            content += "<td title='" + new Date(parseInt(item.sellDate)).toLocaleString() + "''>" 
                    + new Date(parseInt(item.sellDate)).format('mm/dd/yyyy') + "</td>";
            content += "<td>" + new Date(parseInt(item.sellDate)).format('HH:MM:ss') + "</td>";
            content += "<td>" + item.sellPrice + "</td>";
            content += "<td>" + item.sellVolume + "</td>";
            content += "<td>" + item.currPrice + "</td>";
            content += "<td>" + ((item.sellPrice - item.buyPrice) * 100 / item.buyPrice).toFixed(2) + "%</td>";
            
            row.innerHTML = content;
            row.firstChild.setAttribute("code", item.code);

            row.firstChild.addEventListener("click", function(){
                var url = "http://finance.sina.com.cn/realstock/company/"
                        + this.getAttribute("code")
                        + "/nc.shtml";
                window.open(url);
            })
            //content +="</tr>\n";
        }

        
      }
    }
    xhr.send();
}

function clearTbody(tBody){
    try{
        tBody.innerHTML = "";
    }catch(e){
        if(tBody.rows.length > 0){
            for(var i = 0; i < tBody.rows.length; i ++){
                tBody.deleteRow(i);
            }
        }
    }
}