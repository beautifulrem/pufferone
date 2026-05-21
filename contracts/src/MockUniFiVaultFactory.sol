// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {MockUniFiVault} from "./MockUniFiVault.sol";

/// @notice Deploys the 4 PufferOne UniFi mock vaults in a single transaction
/// and exposes them via getter. All 4 vaults use the same deposit token
/// (typically MockPufETH) but with different share prices to simulate
/// distinct yield profiles.
contract MockUniFiVaultFactory {
    MockUniFiVault public immutable unifiETH;
    MockUniFiVault public immutable unifiUSD;
    MockUniFiVault public immutable unifiBTC;
    MockUniFiVault public immutable pufETHs;

    event VaultsDeployed(
        address indexed unifiETH,
        address indexed unifiUSD,
        address indexed unifiBTC,
        address pufETHs
    );

    /// @param depositToken The asset users deposit into all 4 vaults (typically MockPufETH).
    constructor(address depositToken) {
        // unifiETH — moderate yield (5.0%)
        unifiETH = new MockUniFiVault("PufferOne unifiETH", "unifiETH", depositToken, 1.05e18);

        // unifiUSD — stable yield (4.0%)
        unifiUSD = new MockUniFiVault("PufferOne unifiUSD", "unifiUSD", depositToken, 1.04e18);

        // unifiBTC — slightly higher (5.5%)
        unifiBTC = new MockUniFiVault("PufferOne unifiBTC", "unifiBTC", depositToken, 1.055e18);

        // pufETHs — yield-bearing pufETH variant (7.5%)
        pufETHs = new MockUniFiVault("PufferOne pufETHs", "pufETHs", depositToken, 1.075e18);

        emit VaultsDeployed(
            address(unifiETH), address(unifiUSD), address(unifiBTC), address(pufETHs)
        );
    }

    /// @notice Returns the 4 vault addresses for the frontend.
    function getAllVaults() external view returns (address[4] memory) {
        return [address(unifiETH), address(unifiUSD), address(unifiBTC), address(pufETHs)];
    }
}
