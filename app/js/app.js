function cdnIFY() { 
  // get text from text box input from CDN-ify
  var newUrl = document.getElementById("url").value;

  // set up Metamask injected web3 provider
  if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
  web3 = new Web3(web3.currentProvider);

  /// <set up promise variables> ///
  var contract;
  var userAccount;
  var contractDataPromise = $.getJSON('Marlin.json');
  var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
  var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  /// </set up promise variables> ///

  /// <set up contract> ///
  Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
    .then(function initApp(results) {
      var contractData = results[0];
      var networkId = results[1];
      var accounts = results[2];
      userAccount = accounts[0];

      if (!(networkId in contractData.networks)) {
         throw new Error("Contract not found in selected Ethereum network on MetaMask.");
      }
      var contractAddress = contractData.networks[networkId].address;
      contract = new web3.eth.Contract(contractData.abi, contractAddress);
  /// </set up contract> ///

      /// <do contract methods> ///
      contract.methods.addUrl(newUrl, userAccount).call().then(function (url) {
        if (url) { //url is a success boolean
         console.log("Url "+newUrl+" pushed to account " + String(userAccount)+".");
        }
       });
      contract.methods.getAllUrls(userAccount).call().then(function (url) {
         console.log("Total urls on account "+String(userAccount)+": "+String(url));
       });
      //distribute(url) // ----> will get file. Use Pycurl?
    }).catch(console.error);
      /// </do contract methods> ///
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
  // set up Metamask injected web3 provider
  if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
  web3 = new Web3(web3.currentProvider);

  /// <set up promise variables> ///
  var contract;
  var userAccount;
  var contractDataPromise = $.getJSON('Marlin.json');
  var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
  var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  /// </set up promise variables> ///

  /// <set up contract> ///
  Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
    .then(function initApp(results) {
      var contractData = results[0];
      var networkId = results[1];
      var accounts = results[2];
      userAccount = accounts[0];

      if (!(networkId in contractData.networks)) {
         throw new Error("Contract not found in selected Ethereum network on MetaMask.");
      }

      var contractAddress = contractData.networks[networkId].address;
      contract = new web3.eth.Contract(contractData.abi, contractAddress);
  /// </set up contract> ///

      /// <do contract methods> ///
      var bal,spent,hist,live;
      contract.methods.getBalance(userAccount).call().then(function (balance) {
         bal = balance;
       });
      contract.methods.getSpent(userAccount).call().then(function (sp) {
         spent = sp;
       });
      contract.methods.getAllUrls(userAccount).call().then(function (url) {
         hist = url;
       });
      contract.methods.getLiveUrls(userAccount).call().then(function (url) {
         live = url;
         changeBal(bal, spent, hist, live);
       });
    }).catch(console.error);
      /// </do contract methods> ///
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

function app() {
  if (typeof web3 == 'undefined') throw 'No web3 detected. Is Metamask/Mist being used?';
  web3 = new Web3(web3.currentProvider); // MetaMask injected Ethereum provider
  console.log("Using web3 version: " + Web3.version);

  var contract;
  var userAccount;

  var contractDataPromise = $.getJSON('Marlin.json');
  var networkIdPromise = web3.eth.net.getId(); // resolves on the current network id
  var accountsPromise = web3.eth.getAccounts(); // resolves on an array of accounts
  

  Promise.all([contractDataPromise, networkIdPromise, accountsPromise])
    .then(function initApp(results) {
      var contractData = results[0];
      var networkId = results[1];
      var accounts = results[2];
      userAccount = accounts[0];

      if (!(networkId in contractData.networks)) {
         throw new Error("Contract not found in selected Ethereum network on MetaMask.");
      }

      var contractAddress = contractData.networks[networkId].address;
      contract = new web3.eth.Contract(contractData.abi, contractAddress);
      contract.methods.test().call().then(console.log);

      var bal;
      contract.methods.getBalance(userAccount).call().then(function (balance) {
         bal = balance;
         if (bal == null) {
           contract.methods.createPublisher(userAccount, "temp_name", "temp_email").call()
           .then(console.log('publisher created'))
           .catch(function (e) {
             console.log(e);
          });
         contract.methods.getBalance(userAccount).call().then(function (balance) {
           bal = balance;
       });
         }

       });
    })
     .catch(console.error);
}
$(document).ready(app);

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