// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20Mintable} from "./ERC20Mintable.sol";

/// @notice PufferOne mock stETH for Sepolia. Public faucet — anyone can mint up to
/// `faucetCap` per call, rate-limited per address by `faucetCooldown`. Demo only.
contract MockStETH is ERC20Mintable {
    uint256 public constant faucetCap = 100 ether;
    uint256 public constant faucetCooldown = 0; // free testing — no cooldown for hackathon demo

    mapping(address => uint256) public lastFaucetAt;

    error FaucetCooldown();
    error FaucetAmountTooHigh();

    constructor() ERC20Mintable("PufferOne Mock stETH", "stETH", 18) {}

    /// @notice Permissionless faucet for testnet demo. Mint up to `faucetCap` tokens.
    function faucetMint(uint256 amount) external {
        if (amount > faucetCap) revert FaucetAmountTooHigh();
        if (faucetCooldown > 0 && block.timestamp < lastFaucetAt[msg.sender] + faucetCooldown) {
            revert FaucetCooldown();
        }
        lastFaucetAt[msg.sender] = block.timestamp;
        _mint(msg.sender, amount);
    }
}
