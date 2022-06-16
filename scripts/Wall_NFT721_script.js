/*
 * @Author: zhangleh lehan.zhang@sdbean.com
 * @Date: 2022-06-01 10:35:22
 * @LastEditors: zhangleh lehan.zhang@sdbean.com
 * @LastEditTime: 2022-06-10 14:59:00
 * @FilePath: /Nft_hardhat_test/scripts/Wall_NFT721_script.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Wall = await hre.ethers.getContractFactory("Wall");
  const wall = await Wall.deploy("Wall","WALL",1000);
  await wall.deployed();
 
  console.log("Wall deployed to:", wall.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });