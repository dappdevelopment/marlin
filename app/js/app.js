function cdnIFY() { // gets text from text box input from CDN-ify
  var url = document.getElementById("url").value;
  console.log(url);
  app()
  // add user, url to blockchain?
}

document.addEventListener('DOMContentLoaded', function() { // displays info for balance, spent, history, live
  // get strings of account info from blockchain
  if (document.getElementById("balance") !== null) {
  var balance = "bal"
  var spent = "spt"
  var history = "hst"
  var live = "liv"
  document.getElementById("balance").innerHTML = balance;
  document.getElementById("spent").innerHTML = spent;
  document.getElementById("history").innerHTML = history;
  document.getElementById("live").innerHTML = live;
}
});

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

      contract.methods.createPublisher(userAccount, "temp_name", "temp_email").call()
      .then(console.log('publisher created'))
      .catch(function (e) {
        console.log('error in createPublisher')
      });
      
    })
    .then(refreshBalance)
     .catch(console.error);


    function refreshBalance() { // Returns web3's PromiEvent
       // Calling the contract (try with/without declaring view)
       contract.methods.getBalance(userAccount).call().then(function (balance) {
         console.log(balance);
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