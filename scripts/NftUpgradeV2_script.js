/*
 * @Author: zhangleh lehan.zhang@sdbean.com
 * @Date: 2022-06-01 10:35:22
 * @LastEditors: zhangleh lehan.zhang@sdbean.com
 * @LastEditTime: 2022-07-19 11:52:07
 * @FilePath: /Nft_hardhat_test/scripts/Wall_NFT721_script.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const { upgrades } = require("hardhat");

const proxyAddress = "0x16a5d93Da1193FeBb2CeEA7caC2E3C4AaA6C4886";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  console.log("指定Proxy合约地址:",proxyAddress);
  const NFTV2 = await hre.ethers.getContractFactory("NftUpgradeV2");

  console.log("NftUpgrade合约升级中...");
  const proxy = await upgrades.upgradeProxy(proxyAddress,NFTV2);
  console.log("Proxy合约地址:", proxy.address);
  console.log("确认等待两个网络时间...");
  await proxy.deployTransaction.wait(2);
  console.log("管理合约地址:",await upgrades.erc1967.getAdminAddress(proxy.address));
  console.log("逻辑合约地址:",await upgrades.erc1967.getImplementationAddress(proxy.address));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });