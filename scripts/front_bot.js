/*
 * @Author: zhangleh lehan.zhang@sdbean.com
 * @Date: 2022-06-06 10:35:05
 * @LastEditors: zhangleh lehan.zhang@sdbean.com
 * @LastEditTime: 2022-06-07 17:43:35
 * @FilePath: /Nft_hardhat_test/scripts/front_bot.js
 * @Description: opensea front-run
 * @Flow:1.监听通过webscoket监听mempool的pending订单；
 *       2.获取目标token address（解析data）和token id（不能返回，但可以通过爬取目标数据获得）；
 *       3.调用opensea sdk getOrders接口，获取oder订单数据；
 *       4.调用opensea sdk fulfillOrder接口，购买目标标的（通过加gas priority）。
 * @Warning:因为不能获取pending状态下的tokenid，所以不能通过监听数据购买，需要其他手段。
 */
const Web3 = require("web3");
const ethers = require("ethers");
// var wss = "wss://eth-goerli.alchemyapi.io/v2/4vtT6OKliTR3DmTLOjkqmEsFuJS9IlE1"; //测试节点
var wss = "wss://eth-mainnet.alchemyapi.io/v2/6ppvG4FdVD_0Mgk037UMNLpfetmirgV6"; //正式节点
const web3 = new Web3(wss);

// const tools = require("./web3_tools.js");
// tools.BufferToString(wss);
// console.log(tools.AddrKeccak256(wss));

const abi = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"tokenTransferProxy","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"target","type":"address"},{"name":"calldata","type":"bytes"},{"name":"extradata","type":"bytes"}],"name":"staticCall","outputs":[{"name":"result","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newMinimumMakerProtocolFee","type":"uint256"}],"name":"changeMinimumMakerProtocolFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"newMinimumTakerProtocolFee","type":"uint256"}],"name":"changeMinimumTakerProtocolFee","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"array","type":"bytes"},{"name":"desired","type":"bytes"},{"name":"mask","type":"bytes"}],"name":"guardedArrayReplace","outputs":[{"name":"","type":"bytes"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[],"name":"minimumTakerProtocolFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"codename","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addrs","type":"address[7]"},{"name":"uints","type":"uint256[9]"},{"name":"feeMethod","type":"uint8"},{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"howToCall","type":"uint8"},{"name":"calldata","type":"bytes"},{"name":"replacementPattern","type":"bytes"},{"name":"staticExtradata","type":"bytes"}],"name":"calculateCurrentPrice_","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newProtocolFeeRecipient","type":"address"}],"name":"changeProtocolFeeRecipient","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"version","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"buyCalldata","type":"bytes"},{"name":"buyReplacementPattern","type":"bytes"},{"name":"sellCalldata","type":"bytes"},{"name":"sellReplacementPattern","type":"bytes"}],"name":"orderCalldataCanMatch","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"pure","type":"function"},{"constant":true,"inputs":[{"name":"addrs","type":"address[7]"},{"name":"uints","type":"uint256[9]"},{"name":"feeMethod","type":"uint8"},{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"howToCall","type":"uint8"},{"name":"calldata","type":"bytes"},{"name":"replacementPattern","type":"bytes"},{"name":"staticExtradata","type":"bytes"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"validateOrder_","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"incrementNonce","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"basePrice","type":"uint256"},{"name":"extra","type":"uint256"},{"name":"listingTime","type":"uint256"},{"name":"expirationTime","type":"uint256"}],"name":"calculateFinalPrice","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"protocolFeeRecipient","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"renounceOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"addrs","type":"address[7]"},{"name":"uints","type":"uint256[9]"},{"name":"feeMethod","type":"uint8"},{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"howToCall","type":"uint8"},{"name":"calldata","type":"bytes"},{"name":"replacementPattern","type":"bytes"},{"name":"staticExtradata","type":"bytes"}],"name":"hashOrder_","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addrs","type":"address[14]"},{"name":"uints","type":"uint256[18]"},{"name":"feeMethodsSidesKindsHowToCalls","type":"uint8[8]"},{"name":"calldataBuy","type":"bytes"},{"name":"calldataSell","type":"bytes"},{"name":"replacementPatternBuy","type":"bytes"},{"name":"replacementPatternSell","type":"bytes"},{"name":"staticExtradataBuy","type":"bytes"},{"name":"staticExtradataSell","type":"bytes"}],"name":"ordersCanMatch_","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"addrs","type":"address[7]"},{"name":"uints","type":"uint256[9]"},{"name":"feeMethod","type":"uint8"},{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"howToCall","type":"uint8"},{"name":"calldata","type":"bytes"},{"name":"replacementPattern","type":"bytes"},{"name":"staticExtradata","type":"bytes"},{"name":"orderbookInclusionDesired","type":"bool"}],"name":"approveOrder_","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"registry","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"minimumMakerProtocolFee","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addrs","type":"address[7]"},{"name":"uints","type":"uint256[9]"},{"name":"feeMethod","type":"uint8"},{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"howToCall","type":"uint8"},{"name":"calldata","type":"bytes"},{"name":"replacementPattern","type":"bytes"},{"name":"staticExtradata","type":"bytes"}],"name":"hashToSign_","outputs":[{"name":"","type":"bytes32"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"nonces","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"bytes32"}],"name":"cancelledOrFinalized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"exchangeToken","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"addrs","type":"address[7]"},{"name":"uints","type":"uint256[9]"},{"name":"feeMethod","type":"uint8"},{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"howToCall","type":"uint8"},{"name":"calldata","type":"bytes"},{"name":"replacementPattern","type":"bytes"},{"name":"staticExtradata","type":"bytes"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"}],"name":"cancelOrder_","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addrs","type":"address[14]"},{"name":"uints","type":"uint256[18]"},{"name":"feeMethodsSidesKindsHowToCalls","type":"uint8[8]"},{"name":"calldataBuy","type":"bytes"},{"name":"calldataSell","type":"bytes"},{"name":"replacementPatternBuy","type":"bytes"},{"name":"replacementPatternSell","type":"bytes"},{"name":"staticExtradataBuy","type":"bytes"},{"name":"staticExtradataSell","type":"bytes"},{"name":"vs","type":"uint8[2]"},{"name":"rssMetadata","type":"bytes32[5]"}],"name":"atomicMatch_","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"addrs","type":"address[7]"},{"name":"uints","type":"uint256[9]"},{"name":"feeMethod","type":"uint8"},{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"howToCall","type":"uint8"},{"name":"calldata","type":"bytes"},{"name":"replacementPattern","type":"bytes"},{"name":"staticExtradata","type":"bytes"}],"name":"validateOrderParameters_","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"INVERSE_BASIS_POINT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addrs","type":"address[14]"},{"name":"uints","type":"uint256[18]"},{"name":"feeMethodsSidesKindsHowToCalls","type":"uint8[8]"},{"name":"calldataBuy","type":"bytes"},{"name":"calldataSell","type":"bytes"},{"name":"replacementPatternBuy","type":"bytes"},{"name":"replacementPatternSell","type":"bytes"},{"name":"staticExtradataBuy","type":"bytes"},{"name":"staticExtradataSell","type":"bytes"}],"name":"calculateMatchPrice_","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"hash","type":"bytes32"}],"name":"approvedOrders","outputs":[{"name":"approved","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addrs","type":"address[7]"},{"name":"uints","type":"uint256[9]"},{"name":"feeMethod","type":"uint8"},{"name":"side","type":"uint8"},{"name":"saleKind","type":"uint8"},{"name":"howToCall","type":"uint8"},{"name":"calldata","type":"bytes"},{"name":"replacementPattern","type":"bytes"},{"name":"staticExtradata","type":"bytes"},{"name":"v","type":"uint8"},{"name":"r","type":"bytes32"},{"name":"s","type":"bytes32"},{"name":"nonce","type":"uint256"}],"name":"cancelOrderWithNonce_","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"registryAddress","type":"address"},{"name":"tokenTransferProxyAddress","type":"address"},{"name":"tokenAddress","type":"address"},{"name":"protocolFeeAddress","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"hash","type":"bytes32"},{"indexed":false,"name":"exchange","type":"address"},{"indexed":true,"name":"maker","type":"address"},{"indexed":false,"name":"taker","type":"address"},{"indexed":false,"name":"makerRelayerFee","type":"uint256"},{"indexed":false,"name":"takerRelayerFee","type":"uint256"},{"indexed":false,"name":"makerProtocolFee","type":"uint256"},{"indexed":false,"name":"takerProtocolFee","type":"uint256"},{"indexed":true,"name":"feeRecipient","type":"address"},{"indexed":false,"name":"feeMethod","type":"uint8"},{"indexed":false,"name":"side","type":"uint8"},{"indexed":false,"name":"saleKind","type":"uint8"},{"indexed":false,"name":"target","type":"address"}],"name":"OrderApprovedPartOne","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"hash","type":"bytes32"},{"indexed":false,"name":"howToCall","type":"uint8"},{"indexed":false,"name":"calldata","type":"bytes"},{"indexed":false,"name":"replacementPattern","type":"bytes"},{"indexed":false,"name":"staticTarget","type":"address"},{"indexed":false,"name":"staticExtradata","type":"bytes"},{"indexed":false,"name":"paymentToken","type":"address"},{"indexed":false,"name":"basePrice","type":"uint256"},{"indexed":false,"name":"extra","type":"uint256"},{"indexed":false,"name":"listingTime","type":"uint256"},{"indexed":false,"name":"expirationTime","type":"uint256"},{"indexed":false,"name":"salt","type":"uint256"},{"indexed":false,"name":"orderbookInclusionDesired","type":"bool"}],"name":"OrderApprovedPartTwo","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"hash","type":"bytes32"}],"name":"OrderCancelled","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"buyHash","type":"bytes32"},{"indexed":false,"name":"sellHash","type":"bytes32"},{"indexed":true,"name":"maker","type":"address"},{"indexed":true,"name":"taker","type":"address"},{"indexed":false,"name":"price","type":"uint256"},{"indexed":true,"name":"metadata","type":"bytes32"}],"name":"OrdersMatched","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"maker","type":"address"},{"indexed":false,"name":"newNonce","type":"uint256"}],"name":"NonceIncremented","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"}],"name":"OwnershipRenounced","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"}];


// 初始化websocket
var init = async function() {


    var bot_provider = new ethers.providers.WebSocketProvider(wss);
    

    const iface = new ethers.utils.Interface(['function atomicMatch_(address[14] addrs, uint256[18] uints, uint8[8] feeMethodsSidesKindsHowToCalls, bytes calldataBuy, bytes calldataSell, bytes replacementPatternBuy, bytes replacementPatternSell, bytes staticExtradataBuy, bytes staticExtradataSell, uint8[2] vs, bytes32[5] rssMetadata)']);


    // websocket 监听mempool的pending状态tx
    bot_provider.on("pending",(tx)=> {
        bot_provider.getTransaction(tx).then(async function (transaction){
            if(transaction&&transaction.to === "0x7f268357A8c2552623316e2562D90e642bB538E5"){   // 监听opensea交易合约
                const value = web3.utils.fromWei(transaction.value.toString());
                const gasPrice = web3.utils.fromWei(transaction.gasPrice.toString());
                const gasLimit = web3.utils.fromWei(transaction.gasLimit.toString());
                // console.log(transaction);
                let result = [];
                try {
                    result = iface.decodeFunctionData('atomicMatch_',transaction.data);
                    console.log(result);

                    // const receipt = await web3.eth.getTransactionReceipt("0xa63186f52ed7dfdafb300f45bc6a8a9a08a630c5a2054337be6acb68bc4e45cb")
                    // const tokenId = Web3.utils.hexToNumber(receipt.logs[0].topics[3])
                    // console.log(tokenId);
                } catch (error) {
                    console.log(error);
                }
            }
        });
    });

    // websocket 发生错误后重启
    bot_provider.websocket.on("error",async()=>{
        console.log("websocket error!,retrying in 3 sec...");
        setTimeout(init,3000);
    });

    // websocket 关闭后重启
    bot_provider.websocket.on("close",async(code)=>{
        console.log(`Connection lost with code ${code},Attemping connect in 3 sec...`);
        // bot_provider._websocket.terminate();
        setTimeout(init,3000);
    });
}

init();