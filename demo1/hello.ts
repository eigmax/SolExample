const { ethers } = require("ethers");
const fs = require("fs");

console.log("hello!");

const ethProviderUrl = "http://127.0.0.1:7545";
//const provider = new ethers.providers.Web3Provider(window.ethereum)
const provider = new ethers.providers.JsonRpcProvider(ethProviderUrl);
const signer = provider.getSigner();
console.log(signer);

const toAddress = "0x5ae84b86ae52d218d108d0311e50bbd33aaf1c71";

const mnemonic =
  'jar deny prosper gasp flush glass core corn alarm treat leg smart'

let node = ethers.Wallet.fromMnemonic(mnemonic);
console.log(node.privateKey);
const connectedL1Wallet = new ethers.Wallet(node.privateKey, provider)
console.log("from mnemonic",connectedL1Wallet.address);
const address = connectedL1Wallet.address

async function baseApi() {
    const blockNum = await provider.getBlockNumber();
    console.log(blockNum);
    let balance = await provider.getBalance(address)
    let etherBalance = ethers.utils.formatEther(balance);
    console.log(etherBalance);

    const tx = await signer.sendTransaction({
        to: toAddress,
        value: ethers.utils.parseEther("1.0")
    });
    console.log(tx);
    balance = await provider.getBalance(address)
    etherBalance = ethers.utils.formatEther(balance);
    console.log(etherBalance);
}

async function testABI() {
    const contractAddress = "0xAa63764C8942343c903aA3469afe664f6E24FFe2";
    const file = fs.readFileSync("../demo2/build/contracts/Migrations.json");
    const json = JSON.parse(file)
    const ABI = json['abi']
    const bytecode = json['bytecode']

    console.log("ABI", ABI);

    const metaCoin = new ethers.Contract(contractAddress, ABI, signer);
    let instance = await metaCoin.deployed()
    let res = await instance.setCompleted(11111);
    console.log("setCompleted", res);
}

baseApi();
testABI();
