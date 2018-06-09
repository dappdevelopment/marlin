var app_id = "517573"
var key = "35174145270aea54e5c9"
var secret = "d01a6d930ace98914cbc"
var cluster = "mt1"

var eventname = 'commonEvent'
var blockEvent = 'blockchain'

var tokenrec = 0
var numCerts = 0;
var winCerts = 0;

var pusher = new Pusher(
  key, {
  cluster: cluster
});

function appendToConsole(line) {
	stringToAppend = '<p> >> ' + line + '<p>'; 
	$("#myconsole").prepend(stringToAppend);
}

function parseBlockChainMessage(data) {
	if (data.includes("certificate")) {
		appendToConsole(data);
		numCerts ++;
		scElement = document.getElementById('serviceCerti');
		scElement.setAttribute("value", numCerts);
		if (data.includes("Winning")) {
			tokenrec = tokenrec + 1000;
			tokenElement = document.getElementById('tokensRec');
			tokenElement.setAttribute("value", tokenrec);
			winCerts++;
			scElement = document.getElementById('winCerti');
			scElement.setAttribute("value", winCerts);
		}
	}
}