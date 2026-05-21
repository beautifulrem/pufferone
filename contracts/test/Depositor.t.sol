// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockPufETH} from "../src/MockPufETH.sol";
import {MockStETH} from "../src/MockStETH.sol";
import {MockWstETH} from "../src/MockWstETH.sol";
import {MockPufferDepositor} from "../src/MockPufferDepositor.sol";

contract DepositorTest is Test {
    MockPufETH pufeth;
    MockStETH steth;
    MockWstETH wsteth;
    MockPufferDepositor depositor;

    address alice = address(0xA11CE);

    function setUp() public {
        pufeth = new MockPufETH();
        steth = new MockStETH();
        wsteth = new MockWstETH();
        depositor = new MockPufferDepositor(address(pufeth), address(steth), address(wsteth));

        // Authorize the depositor to mint pufETH (mirrors deploy script behavior)
        pufeth.setMinter(address(depositor), true);

        // Fund Alice with input tokens + ETH for happy paths
        vm.deal(alice, 100 ether);
        vm.prank(alice);
        steth.faucetMint(50 ether);
        vm.prank(alice);
        wsteth.faucetMint(50 ether);
    }

    /// ETH path

    function test_depositETH_mintsAt96Rate() public {
        vm.prank(alice);
        uint256 pufETHOut = depositor.depositETH{value: 1 ether}();
        assertEq(pufETHOut, 0.96 ether);
        assertEq(pufeth.balanceOf(alice), 0.96 ether);
    }

    function test_depositETH_rejectsZero() public {
        vm.prank(alice);
        vm.expectRevert(MockPufferDepositor.ZeroAmount.selector);
        depositor.depositETH{value: 0}();
    }

    function test_quoteETH_matchesDeposit() public view {
        assertEq(depositor.quoteETH(5 ether), 4.8 ether);
    }

    /// stETH path

    function test_depositStETH_mintsAt96Rate() public {
        vm.startPrank(alice);
        steth.approve(address(depositor), 10 ether);
        uint256 pufETHOut = depositor.depositStETH(10 ether);
        vm.stopPrank();

        assertEq(pufETHOut, 9.6 ether);
        assertEq(pufeth.balanceOf(alice), 9.6 ether);
        // Tokens transferred to depositor
        assertEq(steth.balanceOf(address(depositor)), 10 ether);
        assertEq(steth.balanceOf(alice), 40 ether); // 50 - 10
    }

    function test_depositStETH_rejectsZero() public {
        vm.prank(alice);
        vm.expectRevert(MockPufferDepositor.ZeroAmount.selector);
        depositor.depositStETH(0);
    }

    /// wstETH path — uses different rate (1.12)

    function test_depositWstETH_mintsAt112Rate() public {
        vm.startPrank(alice);
        wsteth.approve(address(depositor), 10 ether);
        uint256 pufETHOut = depositor.depositWstETH(10 ether);
        vm.stopPrank();

        assertEq(pufETHOut, 11.2 ether);
        assertEq(pufeth.balanceOf(alice), 11.2 ether);
    }

    function test_quoteWstETH_matchesDeposit() public view {
        assertEq(depositor.quoteWstETH(5 ether), 5.6 ether);
    }

    /// Cross-path — depositor must be authorized minter

    function test_depositETH_revertsIfDepositorNotMinter() public {
        // Strip minter rights
        pufeth.setMinter(address(depositor), false);

        vm.prank(alice);
        vm.expectRevert();
        depositor.depositETH{value: 1 ether}();
    }

    /// Event emission

    function test_depositETH_emitsEvent() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true, address(depositor));
        emit MockPufferDepositor.Deposited(alice, address(0), 1 ether, 0.96 ether);
        depositor.depositETH{value: 1 ether}();
    }
}
