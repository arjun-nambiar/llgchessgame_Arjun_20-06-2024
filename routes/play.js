var express = require('express');
const nodeConfig = require('../config/config.js');
const Web3 = require('web3');
const Tx = require('ethereumjs-tx');
var util = require('../config/util.js');
var web3Func = require('../config/web3Call.js');
var ContractABI = require('../config/contractABI.js');
const Provider = require('@truffle/hdwallet-provider');

var router = express.Router();

var abi = JSON.parse(JSON.stringify(ContractABI.abi));

const fromAddress = nodeConfig.fromAddress;
const privateKey = nodeConfig.privateKey;
const contractAddress =nodeConfig.contractAddress;
const provider = nodeConfig.provider;
const Web3Client = new Web3(new Web3.providers.HttpProvider(provider));

const contract = new Web3Client.eth.Contract(abi, contractAddress);


// router.get('/', function(req, res) {
//     res.render('partials/play', {
//         title: 'Chess Hub - Game',
//         user: req.user,
//         isPlayPage: true
//     });
// });

// router.post('/', function(req, res) {
//     var side = req.body.side;
//     //var opponent = req.body.opponent; // playing against the machine in not implemented
//     var token = util.randomString(20);
//     res.redirect('/game/' + token + '/' + side);
// });

router.get('/totalSupply',async function(req, res) {
    const result = await contract.methods.totalSupply().call()
    console.log(result);
    return res.status(200).send({
        success: true,
        msg: "Total Token Supply",
        data:result
    });
});

router.get('/name',async function(req, res) {
    const result = await contract.methods.name().call()
    console.log(result);
    return res.status(200).send({
        success: true,
        msg: "Name of Token",
        data:result
    });
});

router.get('/symbol',async function(req, res) {
    const result = await contract.methods.symbol().call()
    console.log(result);
    return res.status(200).send({
        success: true,
        msg: "Symbol of Token",
        data:result
    });
});

router.get('/walletBalance',async function(req, res) {
    var addr = req.body.address;
    const result = await contract.methods.balanceOf(addr).call()
    console.log(result);
    return res.status(200).send({
        success: true,
        msg: "The Wallet Balance is",
        data:result
    });
});

router.get('/lastBurnDate',async function(req, res) {
    const result = await contract.methods.lastBurnDate().call()
    let date = new Date(result * 1000).toLocaleString();

    console.log(date);
    return res.status(200).send({
        success: true,
        msg: "The Last Burn Date is",
        data:date
    });
});

router.get('/nextAvailableClaimDate',async function(req, res) {
    var addr = req.body.address;
    const result = await contract.methods.nextAvailableClaimDate(addr).call()
    let date = new Date(result * 1000).toLocaleString();

    console.log(date);
    return res.status(200).send({
        success: true,
        msg: "The Next Available Claim Date",
        data:date
    });
});

router.post('/setClaimRewardAsTokenPercentageOld',async function(req, res) {
    var perc = req.body.percentage;
    var hexData = contract.methods.setClaimRewardAsTokensPercentage(perc).encodeABI();
    var hexData = Web3Client.utils.toHex(Data);
    var nonceHex = await web3Func.calculateNonce(fromAddress);
    const estimateGas = await web3Func.gasEstimationForSCCall(hexData,fromAddress,nonceHex,contractAddress);
    const estimateGasHex = Web3Client.utils.toHex(estimateGas);


    const bufferPrivateKey = Buffer.from(privateKey, 'hex');

    const rawTx = {
        nonce: nonceHex,
        gas: estimateGasHex,
        data: hexData,
        from: fromAddress,
        to: contractAddress,
        chainId: "0x38"
    };
        const tx = new Tx(rawTx);
        tx.sign(bufferPrivateKey);
        const serializedTx = tx.serialize();
        Web3Client.eth.sendSignedTransaction('0x' + serializedTx.toString("hex"))
            .on('receipt', function (receipt) {
                console.log("RECEIPT : ", receipt);
                var result = {
                    'contractAddress': contractAddress,
                    'transactionHash': receipt.transactionHash
                };
                return res.status(200).send({
                    success: true,
                    msg: "The Transaction Sucess",
                    data:result
                });
            })
});

router.post('/setClaimRewardAsTokenPercentage',async function(req, res) {
    var perc = req.body.percentage;
    var providerA = new Provider(privateKey, provider);
    var web3A = new Web3(providerA);
    var myContractA = new web3A.eth.Contract(abi, contractAddress);
    var receipt = await myContractA.methods.setClaimRewardAsTokensPercentage(perc).send({ from: fromAddress });
    console.log(receipt);
    return res.status(200).send({
        success: true,
        msg: "The Transaction Sucess",
        data:receipt
    });
})

router.post('/approve',async function(req, res) {
    var spender = req.body.spender;
    var value = req.body.value;
    var providerA = new Provider(privateKey, provider);
    var web3A = new Web3(providerA);
    var myContractA = new web3A.eth.Contract(abi, contractAddress);
    var receipt = await myContractA.methods.approve(spender,value).send({ from: fromAddress });
    console.log(receipt);
    return res.status(200).send({
        success: true,
        msg: "The Transaction Sucess",
        data:receipt
    });
})

module.exports = router;