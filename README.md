# How-to: Native Multisig to EVM

This repository documents how to use Native Multisig transactions to call EVM contract functions

Use [this repository]() for an example implementation with the TelosEscrow Contract.

## Requirements

This repository requires NodeJS 14+ as well as EOSIO's `cleos` & `keosk` and a running `nodeos` instance

**/!\ The EVM address linked to your native account MUST have enough TLOS in balance to pay for gas fees !**

## Install


## Rundown



### 1. Get the EVM Transaction data

`node serializeEVMTransaction.js`

Which will give you back the raw transaction data and the EVM Address linked to your native account as well as an example cleos command, something like:

```SERIALIZED_TX: f8450685746050fb5682a0f49420027f1e6f597c9e2049ddd5ffb0040aa47f613580a44eb665af0000000000....```

```LINKED_ADDRESS: 0xe7209d65c5BB05cdf799b20fF0EC09E691FC3f12```

```CLEOS_COMMAND: cleos --url https://testnet.telos.caleos.io/ push action eosio.evm raw '{ .... ```

### 2. Use `cleos` to call the eosio.evm contract's `raw` action

Copy the CLEOS_COMMAND in the script output or make it yourself:

```
cleos --url https://testnet.telos.caleos.io/ push action eosio.evm raw '{
    "ram_payer": YOUR_NATIVE_ACCOUNT, // ie: thisisnottim
    "tx": SERIALIZED_TX, // the Serialized Transaction output
    "estimate_gas": false,
    "sender": LINKED_ADDRESS // Our Linked Address output
}' -p yournativeaccount
```
