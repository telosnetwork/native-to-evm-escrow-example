import { exec } from 'child_process';
import fs from 'fs';
import  { TelosEvmApi } from "@telosnetwork/telosevm-js";
import fetch from "node-fetch";
import  Transaction from '@ethereumjs/tx'
import  {BigNumber, ethers}  from  'ethers';
import contractABI from './abi/TelosEscrow.js'

const NETWORK_ENDPOINT = "https://testnet.telos.caleos.io/";
const NATIVE_ACCOUNT = "prods.evm";
const CONTRACT_ADDRESS = "0x20027f1e6f597c9e2049ddd5ffb0040aa47f6135";


// const NETWORK_ENDPOINT = "https://mainnet.telos.net/";
// const NATIVE_ACCOUNT = "prods.evm";
// const CONTRACT_ADDRESS = "";

const provider = ethers.getDefaultProvider();
const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, provider);
const evmApi = new TelosEvmApi({
    endpoint: "https://testnet.telos.net",
    chainId: '41',
    ethPrivateKeys: [],
    fetch: fetch,
    telosContract: 'eosio.evm',
    telosPrivateKeys: []
});

(async () => {
    
    // POPULATE EVM TRANSACTION
    try {
        var evmAccount = await evmApi.telos.getEthAccountByTelosAccount(NATIVE_ACCOUNT);
        var evmAddress = evmAccount.address;
        var nonce = parseInt(await evmApi.telos.getNonce(evmAddress), 16);
    } catch(e) {
        console.log(e.message);
        return;
    }

    const feeData = await provider.getFeeData()
    const gasPrice = BigNumber.from(`0x${await evmApi.telos.getGasPrice()}`)
    const gasLimit = 26166;

    try {
        var unsignedTrx =  await contract.populateTransaction.setLockDuration(3600);
    } catch(e) {
        console.log(e.message);
        return;
    }
    unsignedTrx.nonce = nonce;
    unsignedTrx.gasLimit = gasLimit;
    unsignedTrx.gasPrice = gasPrice;

    // SERIALIZE IT
    try {
        var raw = await ethers.utils.serializeTransaction(unsignedTrx);
    } catch(e) {
        console.log(e.message);
        return;
    }
    raw = raw.replace(/^0x/, '');
    
    // SAVE THE NATIVE TRANSACTION TO FILE
    exec('cleos --url '+ NETWORK_ENDPOINT +' push action eosio.evm raw \'{"ram_payer": '+NATIVE_ACCOUNT+', "tx": "'+ raw +'" , "estimate_gas": false, "sender": "'+ evmAddress.replace(/^0x/, '') +'"}\' --expiration 86400 -sjd --json-file output/transaction.json', (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
            // MODIFY IT
            fs.readFile('output/transaction.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    var jsonData = JSON.parse(data);
                    jsonData.actions[0].data = jsonData.actions[0].hex_data;
                    delete jsonData.actions[0].hex_data;
                    jsonData.transaction_extensions = [];
                    fs.writeFile('output/transaction.json', JSON.stringify(jsonData), (err) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('Transaction JSON generated in output/transaction.json')
                        }

                    });
                }
            });
        }
    });

})()
