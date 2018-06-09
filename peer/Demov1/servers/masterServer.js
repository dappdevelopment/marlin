var express = require('express');
var app = express();
var fs = require('fs');
var nacl = require('tweetnacl');
var request = require('request');
var path = require('path');
var url = require('url');
var fsPath = require('fs-path');
var cors = require('cors');
var md5File = require('md5-file');
var bodyParser = require('body-parser');
var util = require('./util');
var Pusher = require('pusher');
var pg = require('pg');

var Web3 = require('web3');
var ethhost = "geth";
const web3 = new Web3(
   // new Web3.providers.HttpProvider('http://'+ethhost+':8545')
   new Web3.providers.WebsocketProvider('ws://'+ethhost+':8546')
);

// to be obtained from db
var selfIp = "localhost";
// to be obtained from db
var selfId = "100";
var privateKey;
var ethAccount;
var certificateContractAddress = "0x60b5f36b62e492c47d7d66b15d9ba9091f18eb5c";
var linContractAddress = "0xF3a55b446Dcc78cD431f4EC6335C50057334CAed";
var certificateContract;
var linContract;

const httpPort = 80;
var rootPath = path.join(__dirname + '/../');
var mediaPath = path.join(__dirname + '/../media/');
var pusherChannel = "master";
var pusherEvent = "commonEvent";

var pusher = new Pusher(util.pusherOptions);

const numVideos = 3;
const numChunksInVideo = 10;
const videoTable = [];

for(i=0; i<numVideos; i++) {
  var prefix = "video"+i;
  videoTable.push([prefix+".m3u8"])
  for(j=0; j<numChunksInVideo; j++) {
    videoTable[i].push(prefix+"_"+j+".ts");
  }
}

const client = new pg.Client(util.postgresOptions);
//client.connect();
client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
});


app.use(bodyParser.json())
app.use(cors())

app.get('/', function(request, response) {
  response.sendFile(rootPath+'/html/newclient.html')
});

app.post('/service-certificate', function(request, response) {
  var body = request.body;
  receivedServiceCertificate(body);
  response.send("OK");

  // var randomNumber = Math.floor(Math.random() * 5);

  // if (randomNumber < 4) {
  //   var message =  "Non-winning service-certificate received"; 
  //   util.addMasterConsoleLog(client, message, selfId);
  //   util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);

  //   response.send("OK");
  // } else {
  //   client.query('UPDATE masterNodeTable SET tokens = tokens + 100 where id = $1 RETURNING tokens', [selfId])
  //   .then((res) => {
  //     console.log(res.rows[0].tokens);
  //     var message = "Winning service-certificate received";
  //     util.addMasterConsoleLog(client, message, selfId);
  //     util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);
  //     util.consoleAndPusherLog(pusherChannel, "tokens", selfId, pusher, res.rows[0].tokens);

  //     response.send("OK");
  //   })
  //   .catch(e => console.error(e.stack))
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
      util.addMasterConsoleLog(client, message, selfId);
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
        util.addMasterConsoleLog(client, message, selfId);
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


app.post('/fileConfirmationFromRelay', function(request, response) {
  var body = request.body;
  var relayUrl = body.relayUrl;
  var resourceName = body.resourceName;
  resourceRelayUrlDict[resourceName] = relayUrl;
  response.send('POST request to the master');
  var pusherMessage = "Storage confirmation from relay for resource: " + resourceName;
  util.consoleAndPusherLog(pusherChannel, pusherChannel, selfId, pusher, pusherMessage);
})

// relay will send its ip
// based on that create an ENTRYy in the relay node table?
// content table me entry. LOL. ek relay ek content.


app.post('/registerRelay', function(request, response) {
  var body = request.body;
  var relayIp = body.ip;
  var port = body.port
  console.log(relayIp);

  var videoNumber = Math.floor(Math.random() * numVideos);
  var videoName = "video"+videoNumber;

  const query = client.query('INSERT INTO relayNodeTable(ip, port, status, masterNodeId, tokens) values($1, $2, $3, $4, $5) RETURNING id',
      [body.ip, body.port, true, selfId, 0]);
  query.then((res) => {
    console.log(res);
    var relayNodeId = res.rows[0].id;

    response.send({"id": relayNodeId, "masterId": selfId, "videoName": videoName, "videoFiles": videoTable[videoNumber]});
  })
  .catch(e => console.error(e.stack))
})


// Static files serving
app.use(function(request, response, next) {

  var resourceName = util.getResourceNameFromUrl(request.url);

  if (path.extname(resourceName) == '.m3u8' || path.extname(resourceName) == '.ts') {
    var message = "Request from client for resource: " + resourceName;
    util.addMasterConsoleLog(client, message, selfId);
    util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);

    var videoName = resourceName.split("_")[0];
    console.log(videoName);

    client.query('SELECT * from relayNodeTable where masterNodeId = $1 AND videoName = $2 AND status = true', [selfId, videoName])
    .then((result) => {
      console.log(result);
      if (result.rows.length != 0) {
        randomNumber = Math.floor(Math.random() * result.rows.length);
        var tempRow = result.rows[randomNumber];
        var relayId = tempRow.id;
        var relayIp = tempRow.ip;
        var relayPort = tempRow.port;
        var redirectUrl = "http://" + relayIp + ":" + relayPort + "/" + resourceName;

        console.log(redirectUrl);

        var ip = relayIp.split(".")[0];
        ip = ip.replace("ec2-", "");
        ip = ip.replace(/-/g ,".")

        var message = "Redirecting to relay: " + ip + ". For resource: " + resourceName;

        util.addMasterConsoleLog(client, message, selfId);
        util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);

        response.redirect(redirectUrl);
      }
      else {
        next();
      }
    })
    .catch(e => console.error(e.stack))
  } else {
    next();
  }
})

app.use(express.static(rootPath));
app.use(express.static(mediaPath));

async function ipSetup() {
  res = await util.promiseRequest({
    url: "http://169.254.169.254/latest/meta-data/public-hostname",
    method: "GET",
  })
  selfIp = res;
}

async function dbSetup() {
  // await client.query('DROP TABLE IF EXISTS masterNodeTable');
  // await client.query('DROP TABLE IF EXISTS relayNodeTable');
  await client.query(
    'CREATE TABLE IF NOT EXISTS masterNodeTable(id SERIAL PRIMARY KEY, ip VARCHAR(100) not null UNIQUE, port integer not null, status BOOLEAN, tokens integer not null, privateKey text, consoleLog text[])');
  await client.query(
    'CREATE TABLE IF NOT EXISTS relayNodeTable(id SERIAL PRIMARY KEY, ip VARCHAR(100) not null, port integer not null, status BOOLEAN, masterNodeId integer not null, tokens integer not null, privateKey text, consoleLog text[], videoName VARCHAR(20))');

  const data = {ip: selfIp, port:httpPort, status: true};
  
  res = await client.query('INSERT INTO masterNodeTable(ip, port, status, tokens) values($1, $2, $3, $4) ON CONFLICT("ip") DO UPDATE SET ip = $1 RETURNING id, privateKey', [data.ip, data.port, data.status, 0]);

  selfId = res.rows[0].id;
  privateKey = res.rows[0].privateKey;

  if (privateKey == null || privateKey == "") {
    ethAccount = web3.eth.accounts.create();
    privateKey = ethAccount.privateKey;
    client.query('UPDATE masterNodeTable SET privateKey = $1 where id = $2', [ethAccount.privateKey, selfId]);
  } else {
    ethAccount = web3.eth.accounts.privateKeyToAccount(privateKey);
  }
  console.log(ethAccount);

  console.log("master node entry created with id:" + selfId);
}

async function setup() {
  await ipSetup();
  await dbSetup();
  loadContracts();
}

setup().then((res) => { app.listen(8000); }).catch(e => { console.log(e) });


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
        client.query('UPDATE masterNodeTable SET tokens = tokens + 10 where id = $1 RETURNING tokens', [selfId])
        .then((res) => {
          console.log(res.rows[0].tokens);
          var message = "Transaction mined successfully for txnhash: " + event.transactionHash;
          util.addMasterConsoleLog(client, message, selfId);
          util.consoleAndPusherLog(pusherChannel, "console", selfId, pusher, message);
          util.consoleAndPusherLog(pusherChannel, "tokens", selfId, pusher, res.rows[0].tokens);
        })
    })
    .on('changed', function(event){
        // remove event from local database
    })
    .on('error', console.error);
}
