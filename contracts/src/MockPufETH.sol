// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20Mintable} from "./ERC20Mintable.sol";

/// @notice PufferOne mock pufETH for Sepolia. Demo only.
/// @dev Only authorized minters (the MockPufferDepositor) can mint. Standard ERC-20
/// otherwise. Real pufETH is mainnet-only; this is a stand-in for demonstrating
/// signing UX and balance flow on Sepolia testnet.
contract MockPufETH is ERC20Mintable {
    constructor() ERC20Mintable("PufferOne Mock pufETH", "pufETH", 18) {}
}
