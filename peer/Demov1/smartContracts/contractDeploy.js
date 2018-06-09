var Web3 = require('web3');
var fs = require('fs');

const web3 = new Web3(
   new Web3.providers.HttpProvider('http://localhost:8545')
);

let abiSource = fs.readFileSync("marlin_token.abi");
let binSource = fs.readFileSync("marlin_token.bin");

let marlinAbi = JSON.parse(abiSource);
console.log(marlinAbi);

let marlinBin = '0x' + binSource;
console.log(marlinBin);

var marlinContract = web3.eth.contract(marlinAbi);

console.log("Unlocking coinbase account");
var password = "amolfound";
try {
  web3.personal.unlockAccount(web3.eth.coinbase, password);
} catch(e) {
  console.log(e);
  return;
}

console.log("Deploying the contract");
let contract = marlinContract.new({from: web3.eth.coinbase, gas: 1000000, data: marlinBin});

// Transaction has entered to geth memory pool
console.log("Your contract is being deployed in transaction at: " + contract.transactionHash);