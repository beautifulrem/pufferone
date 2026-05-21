// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20Mintable} from "./ERC20Mintable.sol";

/// @notice PufferOne mock wstETH for Sepolia. Public faucet. Demo only.
contract MockWstETH is ERC20Mintable {
    uint256 public constant faucetCap = 100 ether;

    error FaucetAmountTooHigh();

    constructor() ERC20Mintable("PufferOne Mock wstETH", "wstETH", 18) {}

    /// @notice Permissionless faucet for testnet demo. Mint up to `faucetCap` tokens.
    function faucetMint(uint256 amount) external {
        if (amount > faucetCap) revert FaucetAmountTooHigh();
        _mint(msg.sender, amount);
    }
}
