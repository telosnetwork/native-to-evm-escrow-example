import { exec } from 'child_process';
import fs from 'fs';
import  { TelosEvmApi } from "@telosnetwork/telosevm-js";
import fetch from "node-fetch";
import  Transaction from '@ethereumjs/tx'
import  {BigNumber, ethers}  from  'ethers';
import contractABI from './abi/TelosEscrow.js';
import dotenv from 'dotenv/config';

const nativeAccount = process.env.NATIVE_ACCOUNT; 

const provider = ethers.getDefaultProvider();
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, provider);
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
        var evmAccount = await evmApi.telos.getEthAccountByTelosAccount(nativeAccount);
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
        var unsignedTrx =  await contract.populateTransaction.setLockDuration(process.env.DURATION);
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
    exec('cleos --url '+ process.env.NETWORK_ENDPOINT +' push action eosio.evm raw \'{"ram_payer": '+nativeAccount+', "tx": "'+ raw +'" , "estimate_gas": false, "sender": "'+ evmAddress.replace(/^0x/, '') +'"}\' --expiration 86400 -sjd --json-file output/transaction.json', (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
            // WAIT 3s
            await new Promise((resolve) => {
                setTimeout(resolve, 3000);
            });
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
