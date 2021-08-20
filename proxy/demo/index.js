var Web3HttpProvider = require('web3-providers-http');
var fs = require('fs');
var https = require('https');
Web3 = require("web3");

web3 = new Web3();

var options = {
    keepAlive: true,
    timeout: 20000, // milliseconds,
    headers: [{name: 'Access-Control-Allow-Origin', value: '*'}],
    withCredentials: false,
    agent: {https: https.Agent({  
        method: 'POST',
        rejectUnauthorized: false,
        // Necessary only if the server uses a self-signed certificate.
	//ca: [fs.readFileSync("../certs/ca.crt")],
        // Necessary only if the server requires client certificate authentication.
        //key: fs.readFileSync("../certs/client.key"),
        //cert: fs.readFileSync("../certs/client.crt")
      })}
};

web3.setProvider(new Web3HttpProvider(process.env.GETH_RPC_URL, options))

web3.eth.getBalance(process.env.WALLET_ADDRESS).then(console.log)
web3.eth.getBlock( 'latest', true, function(error, result) {
    console.log(result) ;   
});
