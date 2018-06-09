var Web3 = require('web3');
var fs = require('fs');

const web3 = new Web3(
   new Web3.providers.HttpProvider('http://localhost:8545')
);

var accountDetails = web3.eth.accounts.create();
console.log(accountDetails);

let abisource = fs.readFileSync("marlin_token.abi");
let binsource = fs.readFileSync("marlin_token.bin");

let marlinAbi = JSON.parse(abisource);
console.log(marlinAbi);

var contractAddress = "0x3de5486da50caa248ea234b8718e1a4bf32ee55e";

var marlinContract = web3.eth.contract(marlinAbi);
var marlinContractInst = marlinContract.at(contractAddress);

console.log("Unlocking coinbase account");
var password = "amolfound";
try {
  web3.personal.unlockAccount(web3.eth.coinbase, password);
} catch(e) {
  console.log(e);
  return;
}

// call constant function
var result = marlinContractInst.balanceOf("0x1020e2b8c3bba3c14e0028f1892d318452e316b0");
console.log(result);

var txhash = marlinContractInst.transfer("0x1020e2b8c3bba3c14e0028f1892d318452e316b0", 100, {from: web3.eth.coinbase, gas: 1000000, nonce: 4});
console.log(txhash);
