var express = require('express');
var app = express();
var fs = require('fs');
var nacl = require('../js/nacl-fast.js');
var request = require('request');
var path = require('path');
var WebSocket = require('ws');
var url = require('url');
var fsPath = require('fs-path');
var cors = require('cors');
var md5File = require('md5-file');
var bodyParser = require('body-parser');
var util = require('./util');
var Pusher = require('pusher');

var Web3 = require('Web3');
var ethhost = "localhost";
const web3 = new Web3(
   new Web3.providers.HttpProvider('http://'+ethhost+':8545')
);

var ethAccount = web3.eth.accounts.create();

const httpPort = 80;
const selfUrl = "http://demo.marlin.pro/";
const authCertiUrl = "http://demo.marlin.pro:8080/authorization-certificate/";
var fileDetailsUploadUrl = "http://demo.marlin.pro:8080/upload/"; // Send post request to master

app.use(bodyParser.json())
app.use(cors())

var clientNum = 1;
var rootPath = path.join(__dirname + '/../')
var mediaPath = path.join(__dirname + '/../media/')
var pusherChannel = "publisher";
var pusherEvent = "commonEvent";

var publisherKeypair = nacl.sign.keyPair();

function createAuthCerti(tempClientAccount) {
  var maxcertis = 100;
  const msg = web3.utils.hexToBytes(ethAccount.address).concat(web3.utils.hexToBytes(tempClientAccount.address)).concat(web3.utils.hexToBytes('0x64'));
  console.log(msg);
  console.log(msg.length);
  const signedStruct = ethAccount.sign(msg);
  console.log(signedStruct);
  const r = signedStruct.r;
  const s = signedStruct.s;
  const v = signedStruct.v;
  const signature = signedStruct.signature;

  var authCerti = signedStruct;
  authCerti.maxcertis = maxcertis;
  authCerti.clientAddress = tempClientAccount.address;
  authCerti.publisherAddress = ethAccount.address;

  console.log(authCerti);
  return authCerti;
}
/*
function getauthcerti() {
  clientkeyPair = nacl.sign.keyPair();
  clientPublicKey = clientkeyPair.publicKey;
  clientPrivateKey = clientkeyPair.secretKey;
  hexclientPubKey = new Buffer(clientPublicKey).toString('hex');
  hexclientPrivateKey = new Buffer(clientPrivateKey).toString('hex');
  var myJSONObject = {'client_pub_key': hexclientPubKey};
  console.log(myJSONObject)
  request({
      url: "http://demo.marlin.pro:8080/authorization-certificate/",
      method: "POST",
      json: true,   // <--Very important!!!
      body: myJSONObject
  }, function (error, response, body){
      authorizationCertificate = body;
      console.log(verifyAuthorizationCertificate(authorizationCertificate))
      console.log(body);
  });
}


function verifyAuthorizationCertificate(authorizationCertificate) {
    var msg = authorizationCertificate.publisher_account_id + hexToString(authorizationCertificate.publisher_pub_key) + hexToString(authorizationCertificate.client_pub_key) + String.fromCharCode(authorizationCertificate.max_service_certificates);
    console.log(msg);
    var arrayBufMsg  = unicodeStringToTypedArray(msg);
    console.log(arrayBufMsg);
    console.log(hexStringToByte(authorizationCertificate.signature.toUpperCase()).length)
    return nacl.sign.detached.verify(arrayBufMsg, hexStringToByte(authorizationCertificate.signature.toUpperCase()), hexStringToByte(authorizationCertificate.publisher_pub_key.toUpperCase()));
    //return nacl.sign.detached.verify(arrayBufMsg, hexStringToByte(authorizationCertificate.signature.toUpperCase()), hexStringToByte(authorizationCertificate.publisher_pub_key.toUpperCase()));
}
*/

////// ROUTING
app.get('/', function(req, res) {
  //util.consoleAndPusherLog(pusherChannel, pusherEvent, pusher, "Received content request from client: " + clientNum);
  clientNum++;

  var tempClientAccount = web3.eth.accounts.create();
  var authorizationCertificate = createAuthCerti(tempClientAccount);

  // var pusherMessage = "sending auth certificate to client with fields. " + "client_pub_key: " + authorizationCertificate.client_pub_key + " | publisher_account_id: " + authorizationCertificate.publisher_account_id + " | max_service_certificates: " + authorizationCertificate.max_service_certificates + " | publisher_pub_key: " + authorizationCertificate.publisher_pub_key + " | signature: " + authorizationCertificate.signature;

  //util.consoleAndPusherLog(pusherChannel, pusherEvent, pusher, pusherMessage);
  res.setHeader('Set-Cookie', [
      'AuthorizationCertificate='+JSON.stringify(authorizationCertificate),
      'PrivateKey='+tempClientAccount.privateKey
    ]);
  res.sendFile(rootPath+'/html/newclient.html');
});

// Portal for client to upload his files
app.get('/uploadContent', function(request, response) {
  response.sendFile(rootPath + "/html/newpublisher.html")
})

app.get('/postResourceToMaster', function(request, response) {
  var fileNames = request.query['fileNames'];
  console.log(fileNames);
  var fileNameHashMap = {};
  for(index in fileNames){
    var fileName = fileNames[index];
    //change the port =======================================================
    if(fileName == ''){
      continue;
    }
    var fileUrl = selfUrl + fileName;
    var localFilePath = mediaPath + fileName;

    checkAndUploadFile(localFilePath, fileName, fileUrl)
  }
})


app.post('/pusherMessage/', function(request, response) {
  var body = request.body;
  var temp_channel = body.channel;
  var temp_event = body.event;
  var temp_data = body.data;
  console.log("message from blockchain");
  response.send('POST request to the publisher');
  //util.consoleAndPusherLog(temp_channel, temp_event, pusher, temp_data);
})

app.use(express.static(rootPath));
app.use(express.static(mediaPath));

app.listen(httpPort);
var pusher = new Pusher(util.pusherOptions);

function checkAndUploadFile(localFilePath, fileName, fileUrl) {
  fs.stat(localFilePath, function(err, stat) {
    if(err == null) {
      console.log('File exists');
      var pusherMessage = "Uploading to blockchain file details, filename: " + fileName + " | localFilePath: " + localFilePath +  " | fileUrl: " + fileUrl;
      //util.consoleAndPusherLog(pusherChannel, pusherEvent, pusher, pusherMessage);
      util.calculateHashAndUpload(fileUrl, localFilePath, fileDetailsUploadUrl);
    } else if(err.code == 'ENOENT') {
        // file does not exist
        var pusherMessage = "Upload request failed. file doesnt exist, filename: " + fileName + " | localFilePath: " + localFilePath +  " | fileUrl: " + fileUrl;
        //util.consoleAndPusherLog(pusherChannel, pusherEvent, pusher, pusherMessage);
    } else {
        console.log('Some other error: ', err.code);
    }
  });
}

// string to uint array
function unicodeStringToTypedArray(s) {
    var escstr = encodeURIComponent(s);
    var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {
        return String.fromCharCode('0x' + p1);
    });
    var ua = new Uint8Array(binstr.length);
    Array.prototype.forEach.call(binstr, function (ch, i) {
        ua[i] = ch.charCodeAt(0);
    });
    return ua;
}

//getauthcerti();
