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
    endpoint: process.env.NETWORK_ENDPOINT,
    chainId: process.env.CHAIN,
    ethPrivateKeys: [],
    fetch: fetch,
    telosContract: 'eosio.evm',
    telosPrivateKeys: []
});

(async () => {
    // Get the linked EVM address & its nonce
    try {
        var evmAccount = await evmApi.telos.getEthAccountByTelosAccount(nativeAccount);
        var evmAddress = evmAccount.address;
        var nonce = parseInt(await evmApi.telos.getNonce(evmAddress), 16);
    } catch(e) {
        console.log(e.message);
        return;
    }
    
    // Get gas data
    const feeData = await provider.getFeeData()
    const gasPrice = BigNumber.from(`0x${await evmApi.telos.getGasPrice()}`)
    const gasLimit = 26166;

    // Use ether to populate the transaction with a call to the relevant method
    try {
        var unsignedTrx =  await contract.populateTransaction.setLockDuration(process.env.DURATION);
    } catch(e) {
        console.log(e.message);
        return;
    }
    unsignedTrx.nonce = nonce;
    unsignedTrx.gasLimit = gasLimit;
    unsignedTrx.gasPrice = gasPrice;

    // Serialize the data using ethers utils
    try {
        var raw = await ethers.utils.serializeTransaction(unsignedTrx);
    } catch(e) {
        console.log(e.message);
        return;
    }
    raw = raw.replace(/^0x/, '');
    
    // SAVE THE NATIVE TRANSACTION TO FILE
    exec('cleos --url '+ process.env.NETWORK_ENDPOINT +' push action eosio.evm raw \'{"ram_payer": '+nativeAccount+', "tx": "'+ raw +'" , "estimate_gas": false, "sender": "'+ evmAddress.replace(/^0x/, '') +'"}\' -p prods.evm --expiration 86400 -sjd --json-file output/transaction.json', async (err, stdout, stderr) => {
        if (err) {
            console.error(err)
        } else {
            // WAIT 5s, JUST IN CASE
            await new Promise((resolve) => {
                setTimeout(resolve, 5000);
            });
            // MODIFY IT
            fs.readFile(process.env.OUTPUT_FOLDER + '/transaction.json', 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                } else {
                    var jsonData = JSON.parse(data);
                    jsonData.actions[0].data = jsonData.actions[0].hex_data;
                    delete jsonData.actions[0].hex_data;
                    jsonData.transaction_extensions = [];
                    fs.writeFile(process.env.OUTPUT_FOLDER + '/transaction.json', JSON.stringify(jsonData), (err) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log('Transaction JSON generated in '+ process.env.OUTPUT_FOLDER + '/transaction.json')
                        }

                    });
                }
            });
        }
    });

})()
