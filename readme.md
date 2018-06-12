# Marlin: Decentralized Content Delivery Network

We're building a secure, blockchain-based protocol to revolutionize economical p2p content delivery with lightning performance.
# 
http://dapps.stanford.edu/marlin
# 
http://www.marlin.pro


# How to use
### Publisher
  - Install MetaMask and get Ether from Rinkeby TestNet
  - Install npm and lite-server, start server using `npm start`
  - If using Ganache local Ethereum node with Truffle installed, change configuration files accordingly and run `truffle migrate --reset`
  - If you don't have MetaMask, you can view the demo here: https://m.youtube.com/watch?v=RmLZ2VDVQHI

### Peer

root directory : peer/Demov1

from commandline root directory :

- Start the servers
  - publisher server: node servers/pubServer.js
  - master server: node servers/masterServer.js
  - relay server: node servers/relayServer.js

From browser:

- Upload using publisher page following files:
  - output.m3u8,resource0.ts,resource1.ts,resource2.ts,resource3.ts,resource4.ts,resource5.ts

- open:
  - client page: http://demo.marlin.pro:8000/ (content served from master)
  - second client: same url as above (content served from relay)



VERY IMPORTANT:

`geth --rinkeby --rpc --rpcapi web3,eth,personal,miner,net,txpool`



changes to run locally:

1. masterServer.js
	httpport: 81
2. relayServer.js
	httpport: 82

3. newclient.html:
	```if (videoSource == null){
                player.src({ type: "application/x-mpegURL", src: "http://cdn.demo-v2.marlin.pro:80/video0.m3u8"});
              }
              else {
                $('#videoSource').val(videoSource);
                player.src({ type: "application/x-mpegURL", src: "http://cdn.demo-v2.marlin.pro:80/"+videoSource });
              }```

4. uncomment ipsetup() masterServer.js
5. uncomment 145 and comment 159 relayserver.js
6. const client = new pg.Client(util.postgresOptions2); master, relay, dashboard

7. ethhost to geth master and relay

LIN: 0xF3a55b446Dcc78cD431f4EC6335C50057334CAed
Certificate: 0x60b5f36b62e492c47d7d66b15d9ba9091f18eb5c 


# FAQ
 - Q: Can I see Marlin in action without running locally?
 - A: Yes, view the publisher app at http://dapps.stanford.edu/marlin and the peer app at http://demo.marlin.pro
 - Q: Where can I learn more about Marlin? 
 - A: You can read our Whitepaper and learn more about the platform at http://www.marlin.pro or at http://dapps.stanford.edu/projects/marlin.
 - Q: Are you still working on this?
 - A: Definitely!
 - Q: How are Marlin's unit economics so much better than traditional CDNs'? 
 - A: We simply utilize latent yet unused preexisting resources to benefit everyone. Also, CDN companies have a monopoly currently.

# What exactly is Marlin?
##### ...and what's the problem with today's internet anyway?
Content Delivery Networks (CDNs) are an integral part of today’s internet. They are designed to improve user experience by providing high availability and low latency by geographically distributing content through a network of proxy servers and data centers. This decreases congestion of the internet backbone by moving supply closer to demand, thereby increasing the effective capacity of the internet and lowering the load times. However, the existing CDNs operate a centralized infrastructure with high upfront costs. This makes expansion and scaling an expensive and risky proposition. Streaming video demand is over 225,000 petabytes per month, and it’s not unusual to find people frustrated with long buffering times. Additionally, rich content on the internet, such as VR, AR and live 4k videos is increasing, and the current internet infrastructure will be stressed to serve such high loads.

##### What are we doing about it?
*Marlin* is a decentralized CDN solution which enables processing, storage, and delivery of content at low cost by utilizing the spare bandwidth and hard drive space of internet users in exchange for network’s native LIN tokens. Blockchains and smart contracts are used to decentralize accounting and payments while also enabling trustless Quality of Service(QoS) checks. The decentralized, peer accelerated infrastructure eliminates risk, lowers congestion and brings supply closer to demand by utilizing idle resources which are only one or few hops away from the end-user.

Despite reducing costs, peers in a P2P network traditionally don’t provide performance or reliability guarantees comparable to dedicated infrastructures. They individually possess lesser resources and have a high churn rate. We thus supplement our peer network with a layer of master nodes which provide better storage and availability guarantees. Our two-tier architecture exploits the Pareto distribution of web requests using a staking mechanism to provide reliability. Unlike the existing Peer-Peer CDN architectures where a peer can only serve the content it has previously requested, our model doesn’t assume such a dependency. Incentivization encourages larger number of peers to join our network ensuring the redundancy required for good performance. We use several smart caching and prepositioning techniques, reinforcement learning, and dynamic congestion control algorithms to enhance QoS further. Marlin can bring down the costs of CDN services by 90% (from the existing 17 cents per GB in some regions to 1.5 cents per GB), without compromising on QoS and reliable accounting expected by websites. Commercial content publishers including media streamers, software enterprises and video game companies can benefit from Marlin’s cheap but performant delivery solutions. In addition to serving the traditional web use cases, Marlin is a marketplace with transcoders, advertisers and several other services built right into the network. Next generation multimedia Dapps with more than basic transactional requirements that don’t wish to rely on existing centralized infrastructure can benefit from the decentralized storage, CDN services and advertising solutions provided by Marlin.

# Implementation / Technical Architecture
The publisher of this dapp uses a Solidity contract that talks to the front end, which is just standard HTML/Javascript. The peer's blockchain portion is implemented in Hyperledger, which manages the contracts, and the frontend is also HTML/JS (and Docker).

# Other Essential Considerations
We often get asked how we are going to control the type of content on Marlin. As with a traditional CDN company, we are going to try to prevent illegal content from being on our network. If you have ideas about how to do this, please contact us!

# Future Plans
Both Praty and Josh are going to continue to work on this, along with a team of around 8 (at the moment) from MIT, ITT Bombay, and Stanford. 
If you have any questions or want to get in touch, you can contact Praty or Josh at {praty, joshp007}@stanford.edu.

*We're streamlining the world's information by putting the internet back into your hands.*
