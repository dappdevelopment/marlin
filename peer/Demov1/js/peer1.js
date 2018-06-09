
var serverConnection;

var authorizationCertificate;
var privateKey;
var serviceCertificate;
var serviceCertificateCount = 0;
var undef;

var ethAccount;

// page ready: websocket connection to central server
function readCookies() {
  authorizationCertificate = JSON.parse(getCookieValue('AuthorizationCertificate'));
  privateKey = getCookieValue('PrivateKey');
  console.log("received auth certificate:");
  console.log(authorizationCertificate);
  console.log("private key:");
  console.log(privateKey);

  console.log(ethereumjsUtil.privateToPublic(ethereumjsUtil.toBuffer(privateKey)));
  //createServiceCertificate();

  // var ethhost = "localhost";
  // const web3 = new Web3(null);
  // ethAccount = web3.personal.importRawKey(privateKey);
  // var pusherMessage = "received auth certificate with fields. " + "client_pub_key: " + authorizationCertificate.client_pub_key + " | publisher_account_id: " + authorizationCertificate.publisher_account_id + " | max_service_certificates: " + authorizationCertificate.max_service_certificates + " | publisher_pub_key: " + authorizationCertificate.publisher_pub_key + " | signature: " + authorizationCertificate.signature;

  // appendToConsole(pusherMessage);
}

var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

function gotMessageFromServer(message) {
  var signal = JSON.parse(message.data);
  console.log(message.data);

  // Ignore messages from ourself
  if(signal.uuid == uuid) return;
}

////////////////////////////////////////////// peer1 /////////////////////////////////////////////////

(function(videojs){
  /**
   * Creates and sends an XMLHttpRequest.
   * TODO - expose video.js core's XHR and use that instead
   *
   * @param options {string | object} if this argument is a string, it
   * is intrepreted as a URL and a simple GET request is
   * inititated. If it is an object, it should contain a `url`
   * property that indicates the URL to request and optionally a
   * `method` which is the type of HTTP request to send.
   * @param callback (optional) {function} a function to call when the
   * request completes. If the request was not successful, the first
   * argument will be falsey.
   * @return {object} the XMLHttpRequest that was initiated.
   */
   videojs.Hls.xhr = function(url, callback) {
    console.log("sending request");
    var
      options = {
        method: 'GET',
        timeout: 45 * 1000
      },
      request,
      abortTimeout;

    if (typeof callback !== 'function') {
      callback = function() {};
    }

    if (typeof url === 'object') {
      options = videojs.util.mergeOptions(options, url);
      url = options.url;
    }

    request = new window.XMLHttpRequest();
    request.open(options.method, url);
    request.url = url;
    request.requestTime = new Date().getTime();

    if (options.responseType) {
      request.responseType = options.responseType;
    }
    if (options.withCredentials) {
      request.withCredentials = true;
    }
    if (options.timeout) {
      abortTimeout = window.setTimeout(function() {
        if (request.readyState !== 4) {
          request.timedout = true;
          request.abort();
        }
      }, options.timeout);
    }

    request.onreadystatechange = function() {
      // wait until the request completes
      if (this.readyState !== 4) {
        return;
      }

      // clear outstanding timeouts
      window.clearTimeout(abortTimeout);

      // request timeout
      if (request.timedout) {
        return callback.call(this, 'timeout', url);
      }

      // request aborted or errored
      if (this.status >= 400 || this.status === 0) {
        return callback.call(this, true, url);
      }

      if (this.response) {
        this.responseTime = new Date().getTime();
        this.roundTripTime = this.responseTime - this.requestTime;
        this.bytesReceived = this.response.byteLength || this.response.length;
        //console.log("bytes recieved:" + this.bytesReceived);
        this.bandwidth = Math.floor((this.bytesReceived / this.roundTripTime) * 8 * 1000);
      }

      // console.log(this.responseURL)

      serviceCertificate = createServiceCertificate(authorizationCertificate);
      //console.log(privateKey);
      console.log(serviceCertificate);

      var parser = document.createElement('a');
      parser.href = this.responseURL;
      var hostName = parser.host;
      // console.log(hostName);

      var ip = hostName.split(".")[0];
      ip = ip.replace("ec2-", "");
      ip = ip.replace(/-/g ,".")
      // console.log(ip);

      var pusherMessage = "received video chunk from source | Sent serviceCertificate to ip: " + ip + " | with fields: " + "Auth certificate. | nonce: " + serviceCertificate.nonce + " | signature.";
      appendToConsole(pusherMessage);


      var myxhr = new XMLHttpRequest();
      myxhr.open('POST', "http://" + hostName + "/service-certificate");


      myxhr.setRequestHeader('Content-type', 'application/json');
      myxhr.onload = function () {
          // do something to response
          console.log(this.responseText);
      };
      myxhr.send(JSON.stringify(serviceCertificate));

      return callback.call(this, false, url);
    };
    request.send(null);
    return request;
  };

})(window.videojs);



function errorHandler(error) {
  console.log(error);
}

// Taken from http://stackoverflow.com/a/105074/515584
// Strictly speaking, it's not a real UUID, but it gets the job done here
function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function getCookieValue(a) {
    var b = document.cookie.match('(^|;)\\s*' + a + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
}



//////////////////////////////////////////////////////////////////////////////////////////////////////

function createServiceCertificate() {
    serviceCertificateCount ++;
    var serviceCertificate = {
        authorizationCertificate: authorizationCertificate,
        nonce: serviceCertificateCount,
    }

    var buff1 = ethereumjsUtil.toBuffer(authorizationCertificate.signature);
    var buff2 = ethereumjsUtil.toBuffer(serviceCertificateCount);
    var msg = buffer.Buffer.concat([buff1, buff2]);
    console.log(buff1);
    console.log(buff2);
    console.log(msg);
    const msgHash = ethereumjsUtil.hashPersonalMessage(msg);
    console.log(msgHash);
    var signatureObject = ethereumjsUtil.ecsign(msgHash, ethereumjsUtil.toBuffer(privateKey));
    serviceCertificate.r = signatureObject.r;
    serviceCertificate.s = signatureObject.s;
    serviceCertificate.v = signatureObject.v;
    console.log(signatureObject);
    console.log(serviceCertificate);
    return serviceCertificate;
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

function hexToString (hex) {
    var string = '';
    for (var i = 0; i < hex.length; i += 2) {
      string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return string;
}

function hexStringToByte(str) {
  if (!str) {
    return new Uint8Array();
  }
  
  var a = [];
  for (var i = 0, len = str.length; i < len; i+=2) {
    a.push(parseInt(str.substr(i,2),16));
  }
  
  return new Uint8Array(a);
}

function byteToHexString(uint8arr) {
  if (!uint8arr) {
    return '';
  }
  
  var hexStr = '';
  for (var i = 0; i < uint8arr.length; i++) {
    var hex = (uint8arr[i] & 0xff).toString(16);
    hex = (hex.length === 1) ? '0' + hex : hex;
    hexStr += hex;
  }
  
  return hexStr.toUpperCase();
}