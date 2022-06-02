/*
 * @Author: zhangleh lehan.zhang@sdbean.com
 * @Date: 2022-06-01 10:33:46
 * @LastEditors: zhangleh lehan.zhang@sdbean.com
 * @LastEditTime: 2022-06-02 14:59:05
 * @FilePath: /Nft_hardhat_test/test/test_wall_nft721.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const {
  expect
} = require("chai");
const {
  ethers
} = require("hardhat");

const { MerkleTree } = require('merkletreejs'); // npm install merkletreejs

const keccak256 = require('keccak256'); // npm install keccak256
const { messagePrefix } = require("@ethersproject/hash");

// 调用dotenv配置方法
require('dotenv').config();



describe("Wall", function () {
  it("Should return the new Wall once it's changed", async function () {
    const Wall = await ethers.getContractFactory("Wall");
    this.wall = await Wall.deploy("WallNFT", "Wall", 1000);
    await this.wall.deployed();

    console.log("Wall deployed to:", this.wall.address);
    const baseUri = "www.baidu.com";

    const wsb = await this.wall.setBaseURI(baseUri);


    expect(await this.wall.getBaseURI()).to.equal(baseUri);

  });

  // merkletree using by merkletreejs、keccak256
  it("MerkleTree Verify", async function () {
    
    const addressElements =  `${process.env.USER_WALLET},0x123,0x345,0x789`.split(','); // ${process.env.USER_WALLET}取值，使用``代替''。
    console.log(addressElements);
    const merklerTree = new MerkleTree(addressElements, keccak256, { hashLeaves: true, sortPairs: true });

    // merkler root node
    const merklerRoot = merklerTree.getHexRoot();
    console.log(merklerRoot);

    // merkler leaf node
    const merklerLeafs = merklerTree.getHexLeaves();
    const leaf = keccak256(addressElements[0]);
    // const leaf = keccak256("addressElements[0]");
    const proof = merklerTree.getHexProof(leaf);
    console.log(merklerLeafs);
    console.log(leaf);
    console.log(proof);

    //test set and get merkletree
    await this.wall.setMerkleRoot(merklerRoot);
    expect(await this.wall.getMerkleRoot()).to.equal(merklerRoot);

    // test verify merkletree by leaf 
    const isVerify = await this.wall.merkleVerify(proof,leaf);
    console.log("isVerify:"+isVerify);

    this.proofVerify = null;
    if (isVerify) {
      this.proofVerify = proof;
    }
  });

  // test alpha mint 
  it("Alpha Mint", async function () {
    
    await this.wall.alphaMint(2,this.proofVerify);


  });
});