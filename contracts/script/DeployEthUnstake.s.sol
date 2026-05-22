// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {MockEthUnstake} from "../src/MockEthUnstake.sol";

/// @notice 单独部署 MockEthUnstake 并预充 ETH，不重新部署其他合约。
///
/// 现有 pufETH 地址通过 env 注入，避免对源码内容做改动。
/// 部署后控制台输出新合约地址 + 储备余额。
///
/// Usage:
///   source .env
///   PUFETH=0xd44387034102491Af58292fF1c7405AED4e7Eb04 \
///   FUND_ETH=0.3 \
///   forge script script/DeployEthUnstake.s.sol \
///     --rpc-url $SEPOLIA_RPC_URL \
///     --private-key $PRIVATE_KEY \
///     --broadcast
contract DeployEthUnstake is Script {
    function run() external {
        address pufeth = vm.envAddress("PUFETH");
        // FUND_ETH 单位 wei，env 字符串 "0.3 ether" 不可直接读，所以我们传裸 wei
        // 推荐做法：脚本里直接硬编码 0.3 ether 这种字面量
        uint256 fundWei = vm.envOr("FUND_WEI", uint256(0.3 ether));

        vm.startBroadcast();

        MockEthUnstake unstake = new MockEthUnstake{value: fundWei}(pufeth);

        vm.stopBroadcast();

        console.log("=== MockEthUnstake Sepolia Deployment ===");
        console.log("pufETH (reused):  ", pufeth);
        console.log("MockEthUnstake:   ", address(unstake));
        console.log("Pre-funded (wei): ", fundWei);
        console.log("Pre-funded (ETH): ", fundWei / 1 ether);
        console.log("Rate (1e18):      ", unstake.rate());
    }
}
