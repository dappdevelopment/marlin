 root directory : Demov1

from commandline root directory :

	Start the servers
	 publisher server: node servers/pubServer.js
	 master server: node servers/masterServer.js
	 relay server: node servers/relayServer.js

From browser:

 	1. open: 

 	2. Upload using publisher page following files:
 		output.m3u8,
 		resource0.ts,resource1.ts,resource2.ts,resource3.ts,resource4.ts,resource5.ts

 	3. open:
 		client page: http://demo.marlin.pro:8000/ (content served from master)
 		second client: same url as above (content served from relay)



VERY IMPORTANT:

geth --rinkeby --rpc --rpcapi web3,eth,personal,miner,net,txpool



changes to run locally:

1. masterServer.js
	httpport: 81
2. relayServer.js
	httpport: 82

3. newclient.html:
	if (videoSource == null){
                player.src({ type: "application/x-mpegURL", src: "http://cdn.demo-v2.marlin.pro:80/video0.m3u8"});
              }
              else {
                $('#videoSource').val(videoSource);
                player.src({ type: "application/x-mpegURL", src: "http://cdn.demo-v2.marlin.pro:80/"+videoSource });
              }

4. uncomment ipsetup() masterServer.js
5. uncomment 145 and comment 159 relayserver.js
6. const client = new pg.Client(util.postgresOptions2); master, relay, dashboard

7. ethhost to geth master and relay




LIN: 0xF3a55b446Dcc78cD431f4EC6335C50057334CAed
Certificate: 0x60b5f36b62e492c47d7d66b15d9ba9091f18eb5c 

