/*
 * @Author: zhangleh lehan.zhang@sdbean.com
 * @Date: 2022-06-07 09:11:53
 * @LastEditors: zhangleh lehan.zhang@sdbean.com
 * @LastEditTime: 2022-06-07 17:43:11
 * @FilePath: /Nft_hardhat_test/scripts/test_tools.js
 * @Description: web3常用工具封装
 */


const erhers = require("ethers");
const keccak256 = require("keccak256");

// import buffer from 'buffer'
// const Buffer = buffer.Buffer;

// tools.type buffer to string
function BufferToString(bufferValue){
    return bufferValue.toString('hex');
}

// string to keccak256
function ToKeccak256(value){
    return BufferToString(keccak256("8462"));
}

// address to keccak256
function AddrKeccak256(addr){
    return erhers.utils.id(addr);
}

// test function
function  testBufferToString(){
    console.log(ToKeccak256("8462"));
    console.log(AddrKeccak256("8462"));
}


// testBufferToString();   //test  buffer to string

module.exports = {ToKeccak256,AddrKeccak256,BufferToString}

