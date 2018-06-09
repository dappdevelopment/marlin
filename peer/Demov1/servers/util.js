var fs = require('fs');
var nacl = require('tweetnacl');
var request = require('request');
var path = require('path');
var url = require('url');
var md5File = require('md5-file');

var util = {

  pusherOptions: {
    appId: "517573",
    key: "35174145270aea54e5c9",
    secret: "d01a6d930ace98914cbc",
    cluster: "mt1"
  },

  postgresOptions: {
    host: 'demo-v2.c26ketswxlli.ap-southeast-1.rds.amazonaws.com',
    port: 5432,
    user: 'marlinprotocol',
    password: 'Aragogteam',
    database: 'demo_v2'
  },

  postgresOptions2 : {
    host: 'localhost',
    port: 5432,
    user: 'marlinprotocol',
    password: 'Aragogteam',
    database: 'demo_v2'
  },

  getResourceNameFromUrl(fileUrl) {
    var resourceName = url.parse(fileUrl).pathname.substr(1);
    return resourceName;
  },

  calculateHashAndUpload: function (fileUrl, localFilePath, uploadUrl) {
    md5File(localFilePath, function(err, hash) {
    if (err) throw err;
    console.log(hash);
    var myJSONObject = {'origin': fileUrl, 'content_hash': hash};
    util.uploadFileDetails(myJSONObject, uploadUrl);
    //fileNameHashMap[fileName] = FILEHASHES[fileName];
    })
  },

  uploadFileDetails: function (fileDetails, uploadUrl){
    console.log(fileDetails);
    util.postRequest(uploadUrl, fileDetails, function(error, response, body) {});
  },

  ensureDirectoryExistence: function (filePath) {
    var dirname = path.dirname(filePath);
    console.log('dirName is ' + dirname);
    if (fs.existsSync(dirname)) {
      return true;
    }
    util.ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
  },  

  requestAndVerifyFile: function (remoteUrl, filehash, filesavepath) {
  request({
    url: remoteUrl,
    method: "GET",
    encoding: null // very very important parameter. LIFESAVER
    }, function (error, response, body) {
        console.log(filesavepath);
        util.ensureDirectoryExistence(filesavepath);
        fs.writeFile(filesavepath, body, 'binary', function(err){
          if(err) {
            throw err;
          } else {
            console.log("wrote a file");
            md5File(filesavepath, function(err, hash) {
                if (err) throw err;
                console.log(filesavepath);
                console.log(filehash);
                console.log(hash);
                if (filehash == hash) {
                  console.log("verified file hash");
                }
              })
          }
        });
       });
  },

  requestAndVerifyFileFromMaster: function (remoteUrl, filehash, filesavepath, localUrl, resourceName) {
  request({
    url: remoteUrl,
    method: "GET",
    encoding: null // very very important parameter. LIFESAVER
    }, function (error, response, body) {
        console.log(filesavepath);
        fs.writeFile( filesavepath, body, 'binary', function(err){
          if(err) {
            throw err;
          } else {
            console.log("wrote a file");
            var fileDetails = {'resourceName':resourceName, 'relayUrl': localUrl}
            request({
                url: "http://demo.marlin.pro:8001/fileConfirmationFromRelay",
                method: "POST",
                json: true,   // <--Very important!!!
                body: fileDetails
            }, function (error, response, body){
            });
            md5File(filesavepath, function(err, hash) {
                if (err) throw err;
                console.log(filesavepath);
                console.log(filehash);
                console.log(hash);
                if (filehash == hash) {
                  console.log("verified file hash");
                }
              })
          }
        });
       });
  },

  consoleAndPusherLog: function(channel, event, id, pusher, message) {
    console.log(message);
    console.log(channel);
    console.log(event);
    pusher.trigger(channel, event, {"id":id, "message": message});
  },

  postRequest: function(url, jsonBody, callback) {
    request({
      url: url,
      method: "POST",
      json: true,
      body: jsonBody
    }, callback)
  },

  addMasterConsoleLog: function(client, message, masterId) {
    client.query('UPDATE masterNodeTable SET consoleLog = array_cat(consoleLog, $1) where id = $2', [[message], masterId])
    .then((result) => {
        console.log(result);
     })
    .catch(e => console.error(e.stack))
  },

  addRelayConsoleLog: function(client, message, relayId) {
    client.query('UPDATE relayNodeTable SET consoleLog = array_cat(consoleLog, $1) where id = $2', [[message], relayId])
    .then((result) => {
        console.log(result);
     })
    .catch(e => console.error(e.stack))
  },

  /*
  registerWithMaster: function (masterUrl, ipData) {
  request({
    url: masterUrl,
    method: "POST",
    json: true,   // <--Very important!!!
    body: ipData
  }, function (error, response, body) {
        //master assigns and id? and also tell about which file to store or is it dynamics 
     });
  },
  */

  promiseRequest: function(requestDict) {
    return new Promise((resolve, reject) => {
      request(requestDict, function(error, response, body) {
        if(error) {
          return reject(error);
        }
        if (response.statusCode >= 400 && response.statusCode < 600) {
          return reject("Status Code: " + resonse.statusCode);
        }
        return resolve(body);
      })
    })
  },
};

module.exports = util;