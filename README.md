# Native Multisig to EVM - Telos Ecrow Example

This repository contains two example scripts to help you construct a `cleos propose` command containing an EVM transaction:

- `generateEVMTransaction`, that serializes the EVM transaction data of a call to the `setLockDuration()` function of the `TelosEscrow` EVM contract
- `generatePermissions`, that retreives the Telos BPs and adds them to a permissions array

## Requirements

This repository requires NodeJS 14+ as well as EOSIO's `cleos` & `keosk` 

**⚠️ The EVM address linked to the prods.evm native account MUST have enough TLOS in balance to pay for gas fees !**

## Install

`npm install`

## Rundown

Sending transactions to EVM requires the use of the eosio.evm contract's `raw(...)` action.

This method takes in the serialized **EVM Transaction data**, the **native account** that will pay the RAM and the **sender address** which the transaction will be sent from on EVM.

In our case the native account will be `prods.evm` and the sender address will be the EVM address linked to that native account, which also owns the TelosEscrow contract and hence is the only one that can modify the settings.

### 1. Prepare the data with `generateEVMTransaction`

The generateEVMTransaction script populates & serializes an EVM transaction and uses it to populate a native transaction with an action that calls eosio.evm `raw(...)` method. This example uses the `setLockDuration` function of the TelosEscrow EVM Contract  with a parameter of `3600` seconds. 

To use it run:

`node generateEVMTransaction.js`

It will generate an `transaction.json` file in the `output` folder

_This script, taken from our [Native to EVM Transaction repository](https://github.com/telosnetwork/native-to-evm-transaction) can easily be adapted to call other methods of the contract such as `setMaxDeposits` or `transferOwnership` or even another contract entirely !_

### 2. Prepare the permissions with `generatePermissions`

To send a multisig, we need to setup the list of signers' permissions. In this Telos Escrow case our signers are the current active BPs.
The generateSignerList script saves those BPs permissions into a file.

To use it run:

`node generatePermissions.js`

It will generate a `permissions.json` file in the `output` folder

### 3. Send your proposal using `cleos`

Run the following cleos command, replacing `YOUR_NATIVE_ACCOUNT` with your Telos native account name and `PROPOSAL` by your proposal's name.

```cleos --url https://testnet.telos.net multisig propose_trx PROPOSAL ./output/permissions.json ./output/transaction.json YOUR_NATIVE_ACCOUNT```

You could also use the [EOSJS library](https://developers.eos.io/manuals/eosjs/latest/index) to create the Multisig proposal directly from your script.

