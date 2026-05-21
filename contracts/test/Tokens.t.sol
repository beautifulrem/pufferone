// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockPufETH} from "../src/MockPufETH.sol";
import {MockStETH} from "../src/MockStETH.sol";
import {MockWstETH} from "../src/MockWstETH.sol";
import {ERC20Mintable} from "../src/ERC20Mintable.sol";

contract TokensTest is Test {
    MockPufETH pufeth;
    MockStETH steth;
    MockWstETH wsteth;

    address owner = address(this);
    address alice = address(0xA11CE);
    address bob = address(0xB0B);

    function setUp() public {
        pufeth = new MockPufETH();
        steth = new MockStETH();
        wsteth = new MockWstETH();
    }

    /// MockPufETH — restricted minter

    function test_pufETH_metadataCorrect() public view {
        assertEq(pufeth.name(), "PufferOne Mock pufETH");
        assertEq(pufeth.symbol(), "pufETH");
        assertEq(pufeth.decimals(), 18);
    }

    function test_pufETH_ownerCanMint() public {
        pufeth.mint(alice, 100 ether);
        assertEq(pufeth.balanceOf(alice), 100 ether);
        assertEq(pufeth.totalSupply(), 100 ether);
    }

    function test_pufETH_nonMinterCannotMint() public {
        vm.prank(alice);
        vm.expectRevert(ERC20Mintable.NotMinter.selector);
        pufeth.mint(alice, 100 ether);
    }

    function test_pufETH_ownerCanAuthorizeNewMinter() public {
        pufeth.setMinter(alice, true);
        vm.prank(alice);
        pufeth.mint(bob, 50 ether);
        assertEq(pufeth.balanceOf(bob), 50 ether);
    }

    function test_pufETH_transferWorks() public {
        pufeth.mint(alice, 100 ether);
        vm.prank(alice);
        pufeth.transfer(bob, 30 ether);
        assertEq(pufeth.balanceOf(alice), 70 ether);
        assertEq(pufeth.balanceOf(bob), 30 ether);
    }

    function test_pufETH_approveAndTransferFrom() public {
        pufeth.mint(alice, 100 ether);
        vm.prank(alice);
        pufeth.approve(bob, 40 ether);
        assertEq(pufeth.allowance(alice, bob), 40 ether);

        vm.prank(bob);
        pufeth.transferFrom(alice, bob, 25 ether);
        assertEq(pufeth.balanceOf(bob), 25 ether);
        assertEq(pufeth.allowance(alice, bob), 15 ether);
    }

    function test_pufETH_transferFromExceedingAllowanceReverts() public {
        pufeth.mint(alice, 100 ether);
        vm.prank(alice);
        pufeth.approve(bob, 10 ether);

        vm.prank(bob);
        vm.expectRevert(ERC20Mintable.InsufficientAllowance.selector);
        pufeth.transferFrom(alice, bob, 20 ether);
    }

    /// MockStETH — public faucet

    function test_stETH_publicFaucetMintsExpectedAmount() public {
        vm.prank(alice);
        steth.faucetMint(50 ether);
        assertEq(steth.balanceOf(alice), 50 ether);
    }

    function test_stETH_faucetRejectsAmountAboveCap() public {
        vm.prank(alice);
        vm.expectRevert(MockStETH.FaucetAmountTooHigh.selector);
        steth.faucetMint(101 ether);
    }

    function test_stETH_multipleFaucetCallsAccumulate() public {
        vm.startPrank(alice);
        steth.faucetMint(50 ether);
        steth.faucetMint(30 ether);
        vm.stopPrank();
        assertEq(steth.balanceOf(alice), 80 ether);
    }

    /// MockWstETH — public faucet, same shape as stETH

    function test_wstETH_publicFaucetMintsExpectedAmount() public {
        vm.prank(alice);
        wsteth.faucetMint(50 ether);
        assertEq(wsteth.balanceOf(alice), 50 ether);
    }

    function test_wstETH_faucetRejectsAmountAboveCap() public {
        vm.prank(alice);
        vm.expectRevert(MockWstETH.FaucetAmountTooHigh.selector);
        wsteth.faucetMint(101 ether);
    }
}
