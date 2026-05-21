// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockPufETH} from "../src/MockPufETH.sol";
import {MockUniFiVault} from "../src/MockUniFiVault.sol";
import {MockUniFiVaultFactory} from "../src/MockUniFiVaultFactory.sol";
import {ERC20Mintable} from "../src/ERC20Mintable.sol";

contract VaultsTest is Test {
    MockPufETH pufeth;
    MockUniFiVault vault;
    MockUniFiVaultFactory factory;

    address alice = address(0xA11CE);

    function setUp() public {
        pufeth = new MockPufETH();
        vault = new MockUniFiVault("Test Vault", "tVAULT", address(pufeth), 1.05e18);
        factory = new MockUniFiVaultFactory(address(pufeth));

        // Fund Alice with pufETH and approve vault
        pufeth.mint(alice, 100 ether);
        vm.prank(alice);
        pufeth.approve(address(vault), type(uint256).max);
    }

    /// Single vault — deposit/withdraw

    function test_vault_depositReturnsCorrectShares() public {
        // sharePrice = 1.05, depositing 10.5 should yield 10 shares
        vm.prank(alice);
        uint256 shares = vault.deposit(10.5 ether);
        assertEq(shares, 10 ether);
        assertEq(vault.balanceOf(alice), 10 ether);
    }

    function test_vault_previewDepositMatchesDeposit() public {
        uint256 preview = vault.previewDeposit(10.5 ether);
        vm.prank(alice);
        uint256 actual = vault.deposit(10.5 ether);
        assertEq(preview, actual);
    }

    function test_vault_withdrawReturnsAssets() public {
        vm.startPrank(alice);
        vault.deposit(10.5 ether); // 10 shares
        uint256 assets = vault.withdraw(10 ether); // burn 10 shares
        vm.stopPrank();
        assertEq(assets, 10.5 ether);
        assertEq(pufeth.balanceOf(alice), 100 ether); // back to start
    }

    function test_vault_previewRedeemMatchesWithdraw() public {
        vm.prank(alice);
        vault.deposit(10.5 ether);
        uint256 preview = vault.previewRedeem(5 ether);
        vm.prank(alice);
        uint256 actual = vault.withdraw(5 ether);
        assertEq(preview, actual);
    }

    function test_vault_rejectsZeroDeposit() public {
        vm.prank(alice);
        vm.expectRevert(MockUniFiVault.ZeroAssets.selector);
        vault.deposit(0);
    }

    function test_vault_withdrawExceedingBalanceReverts() public {
        vm.startPrank(alice);
        vault.deposit(1 ether);
        vm.expectRevert(ERC20Mintable.InsufficientBalance.selector);
        vault.withdraw(10 ether);
        vm.stopPrank();
    }

    function test_vault_ownerCanUpdateSharePrice() public {
        uint256 oldPrice = vault.sharePrice();
        vault.setSharePrice(1.1e18);
        assertEq(vault.sharePrice(), 1.1e18);
        assertGt(vault.sharePrice(), oldPrice);
    }

    function test_vault_nonOwnerCannotUpdateSharePrice() public {
        vm.prank(alice);
        vm.expectRevert(ERC20Mintable.NotOwner.selector);
        vault.setSharePrice(1.2e18);
    }

    /// Factory — 4 vaults

    function test_factory_deploysFourVaults() public view {
        address[4] memory vaults = factory.getAllVaults();
        assertEq(vaults.length, 4);
        for (uint256 i = 0; i < 4; i++) {
            assertTrue(vaults[i] != address(0));
        }
    }

    function test_factory_vaultsHaveDistinctSharePrices() public view {
        assertEq(factory.unifiETH().sharePrice(), 1.05e18);
        assertEq(factory.unifiUSD().sharePrice(), 1.04e18);
        assertEq(factory.unifiBTC().sharePrice(), 1.055e18);
        assertEq(factory.pufETHs().sharePrice(), 1.075e18);
    }

    function test_factory_vaultsHaveExpectedNames() public view {
        assertEq(factory.unifiETH().symbol(), "unifiETH");
        assertEq(factory.unifiUSD().symbol(), "unifiUSD");
        assertEq(factory.unifiBTC().symbol(), "unifiBTC");
        assertEq(factory.pufETHs().symbol(), "pufETHs");
    }

    function test_factory_vaultsShareDepositToken() public view {
        address token = address(pufeth);
        assertEq(address(factory.unifiETH().depositToken()), token);
        assertEq(address(factory.unifiUSD().depositToken()), token);
        assertEq(address(factory.unifiBTC().depositToken()), token);
        assertEq(address(factory.pufETHs().depositToken()), token);
    }
}
