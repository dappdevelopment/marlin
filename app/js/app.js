function cdnIFY() { // gets text from text box input from CDN-ify
  var newUrl = document.getElementById("url").value;
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
      contract.methods.getBalance(userAccount).call().then(function (balance) {
         bal = balance;
       });
      contract.methods.addUrl(newUrl).call().then(function (url) {
         console.log(url)
       });
      
    }).catch(console.error);
}

var bal;
var spent;
var history;
var live;
var hist;


function changeBal() {
  if (document.getElementById("balance") !== null) {
    document.getElementById("balance").innerHTML = bal;
    document.getElementById("spent").innerHTML = spent;
    document.getElementById("history").innerHTML = hist;
    document.getElementById("live").innerHTML = live;
  }
}

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

function submit() { // gets text from text fields to sign up a user
  var name = document.getElementById("name").value;
  var email = document.getElementById("email").value;
  var pw1 = document.getElementById("pw1").value;
  var pw2 = document.getElementById("pw2").value;
  if (pw1 == pw2) {

  }
  console.log(name)
  console.log(email)
  console.log(pw1)
}

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
      contract.methods.getBalance(userAccount).call().then(function (balance) {
         bal = balance;
       });
      contract.methods.createPublisher(userAccount, "temp_name", "temp_email").call()
      .then(console.log('publisher created'))
      .catch(function (e) {
        console.log(e);
      });
      contract.methods.getBalance(userAccount).call().then(function (balance) {
         bal = balance;
       });
      contract.methods.getSpent(userAccount).call().then(function (sp) {
         spent = sp;
         
       });
      contract.methods.getAllUrls(userAccount).call().then(function (url) {
         hist = url;
         console.log(url);
       });
      contract.methods.getLiveUrls(userAccount).call().then(function (url) {
         live = url;
         changeBal();
         console.log(history);
       });

      contract.methods.addUrl("newUrl.com", userAccount).call().then(function (url) {
         console.log(url)
       });

      contract.methods.getAllUrls(userAccount).call().then(function (urls) {
        console.log("a");
        console.log(urls);

        for (i = 0; i < urls; i++) {
          contract.methods.getUrl(i).call().then(function (url) {

            console.log(url);

            });
        }
      })
      
    })
    .then(refreshBalance)
     .catch(console.error);


    function refreshBalance() { // Returns web3's PromiEvent
       // Calling the contract (try with/without declaring view)
       contract.methods.getBalance(userAccount).call().then(function (balance) {
         $('#display').text(balance + " CDT");
         $("#loader").hide();
       });
     }
    function transfer(to, amount) {
    console.log(to, amount)
    if (!to || !amount) return console.log("Fill in both fields");

    $("#loader").show();

    contract.methods.transfer(to, amount).send({from: userAccount})
      .then(refreshBalance)
      .catch(function (e) {
        $("#loader").hide();
      });
  }

  $("#button").click(function() {
    var toAddress = $("#address").val();
    var amount = $("#amount").val();
    transfer(toAddress, amount);
  });

}
$(document).ready(app);