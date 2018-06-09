
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

const httpPort = 8003;

const client = new pg.Client(util.postgresOptions);

client.connect((err) => {
  if (err) {
    console.error('connection error', err.stack)
  } else {
    console.log('connected')
  }
});

app.use(bodyParser.json())
app.use(cors())

var rootPath = path.join(__dirname + '/../');
var mediaPath = path.join(__dirname + '/../mastermedia/');
var pusherChannel = "master";
var pusherEvent = "commonEvent";
var resourceRelayUrlDict = {};

app.get('/', function(request, response) {
  //read the entire db here?
  response.sendFile(rootPath+'/html/dashboard.html')
});

app.get('/getMasterData', function(request, response) {
  // get data
  console.log("sending master data to browser");
  var masterNodeArray;
  client.query("Select id as id, ip, tokens, consoleLog[1:5] from masterNodeTable")
  .then((res) => {
    console.log(res.rows);
    for (var i=0; i<res.rows.length; i++) {
      var ip = res.rows[i].ip.split(".")[0];
      ip = ip.replace("ec2-", "");
      ip = ip.replace(/-/g ,".")
      console.log(ip);
      res.rows[i].ip = ip;
    }
    var returnData = {'masterNodeArray': res.rows}
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(returnData));
  })
  .catch(e => console.error(e.stack))
});

app.get('/getRelayData', function(request, response) {
  // get data
  console.log("sending relay data to browser");
  var RelayNodeArray;
  client.query("Select id as id, ip, tokens, masterNodeId, consoleLog[1:5] from relayNodeTable")
  .then((res) => {
    for (var i=0; i<res.rows.length; i++) {
      var ip = res.rows[i].ip.split(".")[0];
      ip = ip.replace("ec2-", "");
      ip = ip.replace(/-/g ,".")
      console.log(ip);
      res.rows[i].ip = ip;
    }
    var returnData = {'relayNodeArray': res.rows}
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(returnData));
  })
  .catch(e => console.error(e.stack))
});

app.use(express.static(rootPath));


app.listen(httpPort);
var pusher = new Pusher(util.pusherOptions);
