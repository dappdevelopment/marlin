function cdnIFY() { // gets text from text box input from CDN-ify
  var url = document.getElementById("url").value;
  console.log(url);
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
