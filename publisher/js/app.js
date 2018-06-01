var conAddr;
var userAccount;
var accounts;
var networkId;
var contractData;
var contractDataPromise;
var networkIdPromise;
var accountsPromise;
var web3;
var Contract;

function app() {
  
  // set up Metamask injected web3 provider
  if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
  web3 = new Web3(web3.currentProvider);

  /// <set up promise variables> ///
  contractDataPromise = $.getJSON('Marlin.json');
  networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
  accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
    .then(function initApp(results) {
      contractData = results[0];
      networkId = results[1];
      accounts = results[2];
      userAccount = accounts[0];

      if (!(networkId in contractData.networks)) {
         throw new Error("Contract not found in selected Ethereum network on MetaMask.");
      }
      var contractAddress = contractData.networks[networkId].address;
      Contract = new web3.eth.Contract(contractData.abi, contractAddress);
      conAddr = contractAddress;
      Contract.methods.createPublisher(userAccount, "fake_name", "fake_email").call().then(function (pub){
        console.log(pub)
      })
      Contract.methods.getPublisher(userAccount).call().then(function (exists){
        console.log(exists);
      });
      getPeers(false);
  /// </set up contract> ///
      //distribute(url) // ----> will get file. Use Pycurl?
    }).catch(console.error);
}

function getPeers(cdn) {
  var str = "";
  if (!cdn) {
  Contract.methods.getPeers(userAccount).call({from: userAccount}).then(function (url) {
    
     str = url;
     console.log(str);
    var appendingTo = document.getElementById("pl"); // clear previous list, if it exists
    while (appendingTo.firstChild) {
      appendingTo.removeChild(appendingTo.firstChild);
    }
    var strs = str.split(',');
    console.log(str)
    var list = document.createElement("ul");
    list.className = "list-group";
    var index = 0;
    for (var i in strs) {
      if (strs[i]!="") {
        console.log(strs[i]);
        var li = document.createElement("li");
        li.className = "liClear"
        var anchor = document.createElement("a");
        anchor.className = "peerText";
        anchor.innerText = strs[i];
        var elem = document.createElement("button");
        elem.className = "peerButton"
        elem.id = "button"+String(index)
        elem.appendChild(anchor);
        li.appendChild(elem);
        elem.onclick = function() {
          var button = document.getElementById(this.id)
          console.log(this.parentNode.childNodes)
          if (this.parentNode.childNodes[1]!= null) {
            this.parentNode.removeChild(this.parentNode.childNodes[1])
          }
          var url = "http://"+strs[this.id.substr(6)];
          var http = new XMLHttpRequest();
          http.open('HEAD', url, false);
          http.send();
          console.log(http.status)
          if (http.status == 404) {
            var failure = document.createElement("a")
            failure.innerText = "offline"
            failure.className = "failure"
            console.log(this)
            this.parentNode.appendChild(failure)
          } else {
            var success = document.createElement("a")
            success.innerText = "online"
            success.className = "success"
            this.parentNode.appendChild(success)
          }
        }
        
        list.appendChild(li);

        appendingTo.appendChild(list)
        index+=1;
      }
    }
   });
}
  if (cdn) {
    Contract.methods.getPeers(userAccount).call({from: userAccount}).then(function (url) { //todo: get peers and statuses
    
     str = url;
     console.log(str);
    var appendingTo = document.getElementById("pl"); // clear previous list, if it exists
    while (appendingTo.firstChild) {
      appendingTo.removeChild(appendingTo.firstChild);
    }
    var strs = str.split(',');
    console.log(str)
    var list = document.createElement("ul");
    list.className = "list-group";
    for (var i in strs) {
      console.log(strs[i]);
      var anchor = document.createElement("a");
      anchor.innerText = strs[i];
      var elem = document.createElement("li");
      elem.appendChild(anchor);
      list.appendChild(elem);
      appendingTo.appendChild(list)
    }
   });
  }
}


function cdnIFY() { 
  // get text from text box input from CDN-ify
  var newUrl = document.getElementById("url").value;
  var spent = document.getElementById("number").value;
  /// <do contract methods> ///
  Contract.methods.addUrl(newUrl).send({from: userAccount}).then(function (url) {
    if (url) { //url is a success boolean
     console.log("Url "+newUrl+" pushed to account " + String(userAccount)+".");
    }
   });

  Contract.methods.getAllUrls(userAccount).call({from: userAccount}).then(function (url) {
     console.log("Total urls on account "+String(userAccount)+": "+String(url));
   });
  Contract.methods.getPublisher(userAccount).call().then(function (exists){
    console.log(exists);
  });

  Contract.methods.spend(userAccount, spent).send({from: userAccount}).then(function (url) {
    if (url) { //url is a success boolean
     console.log("User "+userAccount+" spent " + String(spent)+" tokens.");
    }
   });
  getPeers(true)
}

///// <helpers> /////
function distribute(url) {
  // get file and save to peer
	fetch('https://crossorigin.me/https://storage.googleapis.com/marlin-cdn/mehran.jpg')
  .then(res => res.blob()) // Gets the response and returns it as a blob
  .then(blob => {
	saveBlobAsFile(blob, "m.jpg")
  });
}

function saveBlobAsFile(blob, fileName) {
  // read retrieved blob into file and provide element to save file
  var reader = new FileReader();
  reader.onloadend = function () {    
      var base64 = reader.result ;
      var link = document.createElement("a");
      link.setAttribute("href", base64);
      link.setAttribute("download", fileName);
      link.click();
  };
  reader.readAsDataURL(blob);
}
///// </helpers> /////

function updateAccounts() {
if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
  web3 = new Web3(web3.currentProvider);
  var bal,spent,hist,live;
   contractDataPromise = $.getJSON('Marlin.json');
  networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
  accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
    .then(function initApp(results) {
      contractData = results[0];
      networkId = results[1];
      accounts = results[2];
      userAccount = accounts[0];

      if (!(networkId in contractData.networks)) {
         throw new Error("Contract not found in selected Ethereum network on MetaMask.");
      }
      var contractAddress = contractData.networks[networkId].address;
      Contract = new web3.eth.Contract(contractData.abi, contractAddress);
      conAddr = contractAddress;

      Contract.methods.getBalance(userAccount).call({from: userAccount}).then(function (balance) {
         bal = balance;
         console.log(typeof(bal))
       });

      Contract.methods.getSpent(userAccount).call({from: userAccount}).then(function (sp) {
         spent = sp;
       });
      Contract.methods.getAllUrls(userAccount).call({from: userAccount}).then(function (url) {
         hist = url;
         console.log(url)
       });
      Contract.methods.getLiveUrls(userAccount).call({from: userAccount}).then(function (url) {
         live = url;
         changeBal(bal, spent, hist, live);
       });
    });
}

///// <helpers> /////
function changeBal(bal, spent, hist, live) {
  if (document.getElementById("balance") !== null) {
    document.getElementById("balance").innerHTML = bal;
    document.getElementById("spent").innerHTML = spent;
    document.getElementById("history").innerHTML = hist;
    document.getElementById("live").innerHTML = live;
  }
}
///// </helpers> /////

/// <for the url metric buttons> ///
function getHistory() { // downloads all urls ever loaded as a .txt file
  var filename = "history";
  var type = ".txt";
  data = "get data from blockchain";
  var file = new Blob([data], {type: type});
  var a = document.createElement("a"),
          url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
  }, 0); 
}

function getLive() { // downloads active urls as a .txt file
  var filename = "live";
  var type = ".txt";
  data = "get data from blockchain";
  var file = new Blob([data], {type: type});

  var a = document.createElement("a"),
          url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);  
  }, 0);
}

/// </for the url metric buttons> ///

// function app() {
//   if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
//   web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
//   console.log("Using web3 version: " + Web3.version);

//   var contract;
//   var userAccount;

//   var contractDataPromise = $.getJSON('Marlin.json');
//   var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
//   var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  

//   Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
//     .then(function initApp(results) {
//       var contractData = results[0];
//       var networkId = results[1];
//       var accounts = results[2];
//       userAccount = accounts[0];

//       if (!(networkId in contractData.networks)) {
//          throw new Error("Contract not found in selected Ethereum network on MetaMask.");
//       }

//       var contractAddress = contractData.networks[networkId].address;
//       contract = new web3.eth.Contract(contractData.abi, contractAddress);
//       contract.methods.test().call().then(console.log);

//       var bal;
//       contract.methods.getBalance(userAccount).call().then(function (balance) {
//          bal = balance;
//          if (bal == null) {
//            contract.methods.createPublisher(userAccount, "temp_name", "temp_email").call()
//            .then(console.log('publisher created'))
//            .catch(function (e) {
//              console.log(e);
//           });
//          contract.methods.getBalance(userAccount).call().then(function (balance) {
//            bal = balance;
//        });
//          }

//        });
//     })
//      .catch(console.error);
// }
// $(document).ready(app);

/*
contract.methods.getAllUrls(userAccount).call().then(function (urls) {
        console.log("a");
        console.log(urls);

        for (i = 0; i < urls; i++) {
          contract.methods.getUrl(i).call().then(function (url) {

            console.log(url);

            });
        }
      })

*/