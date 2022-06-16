/*
 * @Author: zhangleh lehan.zhang@sdbean.com
 * @Date: 2022-05-06 15:08:15
 * @LastEditors: zhangleh lehan.zhang@sdbean.com
 * @LastEditTime: 2022-06-16 11:01:47
 * @FilePath: /Nft_hardhat_test/scripts/test.js
 * @Description: 预授权
 */

require('dotenv').config()
const axios = require('axios');
const Web3 = require("web3");
const { MerkleTree } = require('merkletreejs'); // npm install merkletreejs
const keccak256 = require('keccak256'); // npm install keccak256

const ethers = require("ethers");

const {
    API_GOERLI_URL, // goerli环境provider节点api地址
    WALLET_PRIVATE_KEY, // 用户私钥，签名用
    GOERLI_SCAN_API,    // goerli环境下ethscan 获取abi的api地址
    GOERLI_NFT_ADDRESS, // goerli环境下nft合约地址
    OPENSEA_SEAPORT_APPROVE_ADDRESS //opensea 改版后的operator地址
} = process.env;


var ethersprovider = ethers.providers.getDefaultProvider(API_GOERLI_URL);
var wallet = new ethers.Wallet(WALLET_PRIVATE_KEY,ethersprovider);

//  交易的参数
let tx = {
    
    //   chainId: 1337,
    //   confirmations: 0,
    //   data: '0x',
    //   from: '0x1ab5BBD193f92b63e6AFe275a0a908F8E38BC7aa',
    //   gasLimit: { BigNumber: "21000" },
    //   gasPrice: { BigNumber: "1" },
    //   hash: '0x8b6c7b47be874905dcf14e882ed426a27bce6137db68aa8b673a312d20261cff',
    //   nonce: 5,
    //   r: '0x5c65d745cdd42e98345ecbd3e88ed325476879cc9481cf3ea26d39ad8d6f01ee',
    //   s: '0x4b03f09d1c7ab94ebbdcece3d6213601f95289e54a9a415f01742ed7bd5df2b0',
    //   to: '0x8ba1f109551bD432803012645Ac136ddd64DBA72',
    //   type: null,
    //   v: 2710,
    //   value: { BigNumber: "1000000000000000000" },
    //   wait: [Function]

    gasLimit: 500000,
    value: ethers.utils.parseEther('0.001') //设置每个nft的价格，单位是eth
};


axios.get(GOERLI_SCAN_API+GOERLI_NFT_ADDRESS)
.then(res => {
    var contractABI = "";
    contractABI = JSON.parse(res.data.result);
    var contractInstance = new ethers.Contract(GOERLI_NFT_ADDRESS,contractABI,wallet);  // 获取合约接口

    const addressElements =  `${process.env.USER_WALLET},0x123,0x345,0x789`.split(','); // ${process.env.USER_WALLET}取值，使用``代替''。
    const merklerTree = new MerkleTree(addressElements, keccak256, { hashLeaves: true, sortPairs: true });
    const leaf = keccak256(addressElements[0]);
    const proof = merklerTree.getHexProof(leaf);
  

    // doSetApprovalForAll("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");

    // getIsApprovedForAll(process.env.USER_WALLET,"0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");

    // doAlphaMint(2,proof);



    // mint 
    function doAlphaMint(min_num,merkler_proof){
        contractInstance.functions.alphaMint(min_num,merkler_proof,tx).then((t)=>{
            console.log(t);
        });
    }
    
    // set setApprovalForAll
    function doSetApprovalForAll(operator){
        contractInstance.functions.setApprovalForAll(OPENSEA_SEAPORT_APPROVE_ADDRESS,true).then((t)=>{
            console.log(t);
        });
    }

    // get isApprovedForAll
    function getIsApprovedForAll(owner,operator){
        contractInstance.functions.isApprovedForAll(owner,operator).then((t)=>{
            console.log(t);
        });
    }

});
