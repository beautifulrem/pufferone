// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20Mintable} from "./ERC20Mintable.sol";

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @notice Simplified ERC-4626-style vault for PufferOne demo on Sepolia.
/// Accepts a single deposit token, mints vault shares proportional to sharePrice.
///
///   shares = depositAmount * 1e18 / sharePrice
///   redeem = shares * sharePrice / 1e18
///
/// sharePrice is mutable by owner for simulating APY appreciation during demo,
/// but defaults to the value set at construction.
contract MockUniFiVault is ERC20Mintable {
    IERC20Minimal public immutable depositToken;
    uint256 public sharePrice; // 1e18 = 1 depositToken per share

    event Deposited(address indexed user, uint256 assetsIn, uint256 sharesOut);
    event Withdrawn(address indexed user, uint256 sharesIn, uint256 assetsOut);
    event SharePriceUpdated(uint256 oldPrice, uint256 newPrice);

    error InvalidSharePrice();
    error ZeroAssets();
    error TransferFailed();
    error InsufficientVaultBalance();

    constructor(
        string memory name_,
        string memory symbol_,
        address depositToken_,
        uint256 sharePrice_
    ) ERC20Mintable(name_, symbol_, 18) {
        if (sharePrice_ == 0) revert InvalidSharePrice();
        depositToken = IERC20Minimal(depositToken_);
        sharePrice = sharePrice_;
    }

    /// @notice Compute shares received for an asset deposit (frontend simulation).
    function previewDeposit(uint256 assets) public view returns (uint256) {
        return (assets * 1e18) / sharePrice;
    }

    /// @notice Compute assets returned for a share redemption (frontend simulation).
    function previewRedeem(uint256 shares) public view returns (uint256) {
        return (shares * sharePrice) / 1e18;
    }

    /// @notice Deposit assets, receive shares. Requires prior approval on depositToken.
    function deposit(uint256 assets) external returns (uint256 shares) {
        if (assets == 0) revert ZeroAssets();
        if (!depositToken.transferFrom(msg.sender, address(this), assets)) {
            revert TransferFailed();
        }
        shares = previewDeposit(assets);
        _mint(msg.sender, shares);
        emit Deposited(msg.sender, assets, shares);
    }

    /// @notice Redeem shares, receive assets.
    function withdraw(uint256 shares) external returns (uint256 assets) {
        assets = previewRedeem(shares);

        // Burn shares from caller
        uint256 bal = balanceOf[msg.sender];
        if (bal < shares) revert ERC20Mintable.InsufficientBalance();
        unchecked {
            balanceOf[msg.sender] = bal - shares;
        }
        totalSupply -= shares;
        emit Transfer(msg.sender, address(0), shares);

        // Return assets to caller
        if (depositToken.balanceOf(address(this)) < assets) revert InsufficientVaultBalance();
        if (!depositToken.transfer(msg.sender, assets)) revert TransferFailed();
        emit Withdrawn(msg.sender, shares, assets);
    }

    /// @notice Owner can adjust sharePrice to simulate APY accrual during demo.
    function setSharePrice(uint256 newSharePrice) external onlyOwner {
        if (newSharePrice == 0) revert InvalidSharePrice();
        emit SharePriceUpdated(sharePrice, newSharePrice);
        sharePrice = newSharePrice;
    }
}
