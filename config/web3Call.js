const Web3 = require('web3');

var ContractABI = require('./contractABI.js');

var abi = JSON.parse(JSON.stringify(ContractABI.abi));


const contractAddress ="0x4691F60c894d3f16047824004420542E4674E621";
const provider ="https://bsc-dataseed.binance.org/";
const Web3Client = new Web3(new Web3.providers.HttpProvider(provider));

const contract = new Web3Client.eth.Contract(abi, contractAddress);


async function calculateNonce(address) {
    var calculatedNounce;
    await Web3Client.eth.getTransactionCount(address, (err, result) => {
        calculatedNounce = result;
    });
    return Web3Client.utils.toHex(calculatedNounce);
}

module.exports.calculateNonce = calculateNonce;

async function gasEstimationForSCCall(hexdata, from, nonce, to) {
    var gasEstimate;
    await Web3Client.eth.estimateGas
        ({
            "from"      : from,       
            "nonce"     : nonce, 
            "to"        : to,     
            "data"      : hexdata
    }, (err, result) => {
        gasEstimate = Web3Client.utils.toHex(result);
    });
    return gasEstimate;
}
module.exports.gasEstimationForSCCall = gasEstimationForSCCall;

async function sendSignedTransaction(rawTx, privateKey) {
    var result;
    let tx = new Tx(rawTx);
    let bufferPrivateKey = Buffer.from(privateKey, 'hex');
    tx.sign(bufferPrivateKey);
    let serializedTx = tx.serialize();
    await Web3Client.eth.sendSignedTransaction('0x' + serializedTx.toString("hex"))
        .on('receipt', function (receipt) {
            console.log('receipt-----**********************------');
            console.log('receipt', receipt);
            console.log('receipt -----**********************-----');
            console.log('receipt', receipt.contractAddress, rawTx.to);
            let scAdd = rawTx.to;
            if (!scAdd)
                scAdd = receipt.contractAddress

            result = {
                'contractAddress': scAdd,
                'transactionHash': receipt.transactionHash,
                status: true
            };
        })
        .on('error', function (error) {
            result = {
                status: false,
                error: error
            };
        });
    return result;
}
module.exports.sendSignedTransaction = sendSignedTransaction;

async function contractTxSend(hexdata, privateKey, res, contractAddress) {
    console.log(contractAddress);

    var nonce = await calculateNonce(masterAddress);
    let nonceHex = nonce;
    let gasEstimate = "0x11E1A300";

    let rawTx = {
        nonce: nonceHex,
        gas: gasEstimate,
        data: hexdata,
        from: masterAddress,
        to: contractAddress,
        chainId: 10
    };

    let txDetails = await sendSignedTransaction(rawTx, privateKey);
    console.log('txDetails --------------->',txDetails);
    if (txDetails.status) {
        res.send(new __res.SUCCESS(true, txDetails, "success").response);
    } else {
        res.status(400).send(new __res.BAD_REQUEST(false, null, "Failed Blockchain Transaction " + txDetails).response);
    }
}
module.exports.contractTxSend = contractTxSend;


