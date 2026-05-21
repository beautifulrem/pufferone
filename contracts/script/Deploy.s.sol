// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";

import {MockPufETH} from "../src/MockPufETH.sol";
import {MockStETH} from "../src/MockStETH.sol";
import {MockWstETH} from "../src/MockWstETH.sol";
import {MockPufferDepositor} from "../src/MockPufferDepositor.sol";
import {MockUniFiVaultFactory} from "../src/MockUniFiVaultFactory.sol";
import {MockSwapRouter} from "../src/MockSwapRouter.sol";

/// @notice One-shot deployment for PufferOne mock contracts on Sepolia.
///
/// Usage:
///   source .env
///   forge script script/Deploy.s.sol \
///     --rpc-url $SEPOLIA_RPC_URL \
///     --private-key $PRIVATE_KEY \
///     --broadcast
///
/// On success, addresses are emitted via console.log. They also land in
/// broadcast/Deploy.s.sol/11155111/run-latest.json under `transactions[].contractAddress`.
contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy ERC-20 tokens
        MockPufETH pufeth = new MockPufETH();
        MockStETH steth = new MockStETH();
        MockWstETH wsteth = new MockWstETH();

        // 2. Deploy depositor (pulls input tokens, mints pufETH)
        MockPufferDepositor depositor =
            new MockPufferDepositor(address(pufeth), address(steth), address(wsteth));

        // 3. Authorize depositor to mint pufETH
        pufeth.setMinter(address(depositor), true);

        // 4. Deploy UniFi vault factory (creates 4 vaults using pufETH as deposit token)
        MockUniFiVaultFactory factory = new MockUniFiVaultFactory(address(pufeth));

        // 5. Deploy swap router and authorize on pufETH (router mints pufETH as output)
        MockSwapRouter router = new MockSwapRouter();
        pufeth.setMinter(address(router), true);
        wsteth.setMinter(address(router), true);
        steth.setMinter(address(router), true);

        // 6. Configure swap router rates
        // Direct paths to pufETH
        router.setRate(address(steth), address(pufeth), 0.96e18);
        router.setRate(address(wsteth), address(pufeth), 1.12e18);
        // Inter-stake-token paths (for multi-hop demos)
        router.setRate(address(steth), address(wsteth), 0.83e18);
        router.setRate(address(wsteth), address(steth), 1.20e18);
        // Reverse paths (so users can demonstrate withdrawing pufETH back to stake assets)
        router.setRate(address(pufeth), address(steth), 1.04e18);
        router.setRate(address(pufeth), address(wsteth), 0.89e18);

        vm.stopBroadcast();

        // Log addresses for downstream consumption
        console.log("=== PufferOne Sepolia Deployment ===");
        console.log("MockPufETH:               ", address(pufeth));
        console.log("MockStETH:                ", address(steth));
        console.log("MockWstETH:               ", address(wsteth));
        console.log("MockPufferDepositor:      ", address(depositor));
        console.log("MockUniFiVaultFactory:    ", address(factory));
        console.log("  unifiETH:               ", address(factory.unifiETH()));
        console.log("  unifiUSD:               ", address(factory.unifiUSD()));
        console.log("  unifiBTC:               ", address(factory.unifiBTC()));
        console.log("  pufETHs:                ", address(factory.pufETHs()));
        console.log("MockSwapRouter:           ", address(router));
    }
}
