var express = require('express');
var app = express();
var fs = require('fs');
var nacl = require('tweetnacl');
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
var pg = require('pg');
var mkdirp = require('mkdirp');

var Web3 = require('web3');
var ethhost = "geth";
const web3 = new Web3(
   // new Web3.providers.HttpProvider('http://'+ethhost+':8545')
   new Web3.providers.WebsocketProvider('ws://'+ethhost+':8546')
);

// to be obtained from query to amazon
var selfIp = "localhost";
// to be obtained from master
var selfId = "1";
var masterId;
var privateKey;
var ethAccount;
var certificateContractAddress = "0x60b5f36b62e492c47d7d66b15d9ba9091f18eb5c";
var linContractAddress = "0xF3a55b446Dcc78cD431f4EC6335C50057334CAed";
var certificateContract;
var linContract;

const httpPort = 80;
const selfUrl = "http://demo.marlin.pro:8002/";
var rootPath = path.join(__dirname + '/../')
var mediaPath = path.join(__dirname + '/../relaymedia/')
var pusherChannel = "relay";
var pusherEvent = "commonEvent";

var pusher = new Pusher(util.pusherOptions);

const client = new pg.Client(util.postgresOptions);
//client.connect();
client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
});

app.use(bodyParser.json());
app.use(cors());


app.get('/', function(request, response) {
  response.sendFile(rootPath+'/html/newrelay.html')
});

app.post('/service-certificate', function(request, response) {
  var body = request.body;
  receivedServiceCertificate(body);
  response.send("OK");
  // var randomNumber = Math.floor(Math.random() * 5);

  // if (randomNumber < 4) {
  //   var message =  "Non-winning service-certificate received"; 
  //   util.addRelayConsoleLog(client, message, selfId);
  //   util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);

  //   response.send("OK");
  // } else {
  //     client.query('UPDATE masterNodeTable SET tokens = tokens + 25 where id = $1 RETURNING tokens', [masterId])
  //     .then((res) => {
  //       var message = "received 25% redirection fee";
  //       util.addMasterConsoleLog(client, message, masterId);
  //       util.consoleAndPusherLog("master", "console", masterId, pusher, message);
  //       util.consoleAndPusherLog("master", "tokens", masterId, pusher, res.rows[0].tokens);
  //     })

  //     client.query('UPDATE relayNodeTable SET tokens = tokens + 100 where id = $1 RETURNING tokens', [selfId])
  //     .then((res) => {
  //       console.log(res.rows[0].tokens);
  //       var message =  "Winning service-certificate received";
  //       util.addRelayConsoleLog(client, message, selfId);
  //       util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);
  //       util.consoleAndPusherLog(pusherChannel, "tokens", selfId, pusher, res.rows[0].tokens)

  //       response.send("OK");
  //     })
  //     .catch(e => console.error(e.stack))
  // }
})

function receivedServiceCertificate(serviceCertificate) {
    // Sign and check winning
    var rsvArray = [Buffer.from(serviceCertificate.r.data), Buffer.from(serviceCertificate.s.data), Buffer.from([serviceCertificate.v])];
    const msg = Buffer.concat(rsvArray);
    const signedStruct = ethAccount.sign(msg);
    console.log(signedStruct);
    const r = signedStruct.r;
    const s = signedStruct.s;
    const v = signedStruct.v;

    //const finalHash = web3.utils.sha3(v + r + s);
    const finalHash = web3.utils.soliditySha3(signedStruct.signature);
    const finalHashArr = web3.utils.hexToBytes(finalHash);
    console.log(finalHashArr);
    console.log(finalHashArr[0]);
    // 25% chance
    if ((finalHashArr[0] & 0x3) != 0) {
      var message =  "Non-winning service-certificate received."; 
      util.addRelayConsoleLog(client, message, selfId);
      util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);
      return; 
    }

    var authorizationCertificate = serviceCertificate.authorizationCertificate;
    console.log(authorizationCertificate);
    
    let tx_builder = certificateContract.methods.settleWinningCertificate(
        authorizationCertificate.publisherAddress,
        authorizationCertificate.clientAddress,
        authorizationCertificate.maxcertis,
        serviceCertificate.nonce,
        [
            authorizationCertificate.v,
            serviceCertificate.v,
            v,
        ],
        [
            authorizationCertificate.r,
            web3.utils.bytesToHex(serviceCertificate.r.data),
            r,
        ],
        [
            authorizationCertificate.s,
            web3.utils.bytesToHex(serviceCertificate.s.data),
            s,
        ],
    );

    let encoded_tx = tx_builder.encodeABI();
    let transactionObject = {
        gas: 1000000,
        gasPrice: 0, 
        data: encoded_tx,
        from: ethAccount.address,
        to: certificateContractAddress
    };

    web3.eth.accounts.signTransaction(transactionObject, privateKey).then(signed => {
      var tran = web3.eth.sendSignedTransaction(signed.rawTransaction);

      tran.on('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmation: ' + confirmationNumber);
      });

      tran.on('transactionHash', hash => {
        console.log('hash');
        console.log(hash);
        var message =  "Winning service-certificate received. Submitted to network for verification with txnhash: " + hash; 
        util.addRelayConsoleLog(client, message, selfId);
        util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);
      });

      tran.on('receipt', receipt => {
        console.log('reciept');
        console.log(receipt);
      });

      tran.on('error', console.error);
    })
    .catch(e => console.error(e.stack))
}

app.post('/uploadContentToRelay', function(request, response) {
  var body = request.body;
  var fileUrl = body.origin;
  var filehash = body.content_hash;
  var resourceName = util.getResourceNameFromUrl(fileUrl);
  var fileSavePath = path.join(mediaPath, resourceName);
  var localUrl = selfUrl + resourceName;
  response.send('POST request to the relay');
  var pusherMessage = "MSG from master to download file from publisher. Requesting from Master. Fileurl: " + fileUrl + " | resourceName: " + resourceName + " | fileSavePath: " + fileSavePath;

  util.consoleAndPusherLog(pusherChannel, pusherEvent, selfId, pusher, pusherMessage);
  util.requestAndVerifyFileFromMaster(fileUrl, filehash, fileSavePath, localUrl, resourceName);
})

app.use(function(request, response, next) {

  var resourceName = util.getResourceNameFromUrl(request.url);

  if (path.extname(resourceName) == '.m3u8' || path.extname(resourceName) == '.ts') {

    var message = "Request from client for resource: " + resourceName;
    util.addRelayConsoleLog(client, message, selfId);
    util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);

    var localFilePath = mediaPath + resourceName;
    fs.stat(localFilePath, function(err, stat) {
      if(err == null) {
        var pusherMessage = "Serving to client: " + resourceName;
        //pusher.trigger(pusherChannel, pusherEvent, pusher);
        util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, pusherMessage);
      } else if(err.code == 'ENOENT') {
          // file does not exist
          var pusherMessage = "Request from client for resource: " + resourceName + ". File doesnt exist. localFilePath: " + localFilePath;
          util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, pusherMessage);
        } else {
          console.log('Some other error: ', err.code);
        }
      });
  }
  next();
})

app.use(express.static(rootPath));
app.use(express.static(mediaPath));

async function RegisterWithMaster() {

  ethAccount = web3.eth.accounts.create();
  privateKey = ethAccount.privateKey;
  console.log(ethAccount);

  var regionQueryUrl = "http://169.254.169.254/latest/meta-data/placement/availability-zone";

  var region = await util.promiseRequest({
    url: regionQueryUrl,
    method: "GET",
  });

  var masterUrl = "http://master." + region + ".demo-v2.marlin.pro/";

  res = await util.promiseRequest({
    url: "http://169.254.169.254/latest/meta-data/public-hostname",
    method: "GET",
  })
  selfIp = res;

  // comment this shit
  //var masterUrl = "http://localhost:81/";
  
  var jsonBody = {ip: selfIp, port:httpPort};
  body = await util.promiseRequest({
    url: masterUrl+"registerRelay",
    method: "POST",
    json: true,
    body: jsonBody,
  })

  console.log(body);
  selfId = body.id;
  masterId = body.masterId;

  promiseArray = body.videoFiles.map((item) => {
    var filename = item;
    var fileurl = masterUrl + filename;
    return util.promiseRequest({
      url: fileurl,
      method: "GET",
      encoding: null // very very important parameter. LIFESAVER
    }).then((body) => {
      return new Promise((resolve, reject) => {
        var filesavepath = path.join(mediaPath, filename);

        mkdirp(path.dirname(filesavepath), function (err) {
          if (err){
            return reject(err);
          }

          fs.writeFile(filesavepath, body, 'binary', function(err){
            if(err) {
              return reject(err);
            } else {
              console.log(body);
              console.log("wrote a file");
              resolve("success");
            }
          });
        });
      });
    });
  });

  await Promise.all(promiseArray);
  await client.query('UPDATE relayNodeTable SET videoName = $1 where id = $2', [body.videoName, selfId])
}


RegisterWithMaster()
.then((res) => { 
  loadContracts();
  app.listen(8000); })
.catch(e => { console.log(e) });


function loadContracts() {
  let certificateAbiSource = fs.readFileSync("smartContracts/Certificate.abi");
  let linAbiSource = fs.readFileSync("smartContracts/Lin.abi");
  let certificateAbi = JSON.parse(certificateAbiSource);
  let linAbi = JSON.parse(linAbiSource);
  certificateContract = new web3.eth.Contract(certificateAbi, certificateContractAddress);
  linContract = new web3.eth.Contract(linAbi, linContractAddress);

  linContract.events.Transfer({
      filter: {from: certificateContractAddress, to: ethAccount.address}, 
      fromBlock: 0
      }, function(error, event){ 
        console.log(event); 
        console.log(error)
       }
    )
    .on('data', function(event){
        console.log("event");
        console.log(event); // same results as the optional callback above
        client.query('UPDATE relayNodeTable SET tokens = tokens + 10 where id = $1 RETURNING tokens', [selfId])
        .then((res) => {
          console.log(res.rows[0].tokens);
          var message = "Transaction mined successfully for txnhash: " + event.transactionHash;
          util.addRelayConsoleLog(client, message, selfId);
          util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);
          util.consoleAndPusherLog(pusherChannel, "tokens", selfId, pusher, res.rows[0].tokens);
        })
    })
    .on('changed', function(event){
        // remove event from local database
    })
    .on('error', console.error);
}

