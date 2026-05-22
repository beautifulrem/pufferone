// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockPufETH} from "../src/MockPufETH.sol";
import {MockEthUnstake} from "../src/MockEthUnstake.sol";

contract EthUnstakeTest is Test {
    MockPufETH pufeth;
    MockEthUnstake unstake;

    address alice = address(0xA11CE);

    function setUp() public {
        pufeth = new MockPufETH();
        // 部署 + 充值 5 ETH 流动性
        unstake = new MockEthUnstake{value: 5 ether}(address(pufeth));
        // 给 alice 一些 pufETH 用来测试
        pufeth.mint(alice, 10 ether);
        // 给 alice 一些 gas（实际上 unstake 也会发 ETH，这里只是确保有 ETH 付 gas）
        vm.deal(alice, 0);
    }

    function testQuoteMatchesRate() public view {
        // 默认 rate 1.04e18 → 1 pufETH = 1.04 ETH
        assertEq(unstake.quoteUnstake(1 ether), 1.04 ether);
        assertEq(unstake.quoteUnstake(0.5 ether), 0.52 ether);
        assertEq(unstake.quoteUnstake(0), 0);
    }

    function testReserveReflectsFunding() public view {
        assertEq(unstake.ethReserve(), 5 ether);
    }

    function testUnstakeETHHappyPath() public {
        vm.startPrank(alice);
        pufeth.approve(address(unstake), 1 ether);
        uint256 before = alice.balance;
        uint256 ethOut = unstake.unstakeETH(1 ether);
        vm.stopPrank();

        assertEq(ethOut, 1.04 ether);
        assertEq(alice.balance, before + 1.04 ether);
        // pufETH 被转到合约里（等同 burn from circulation）
        assertEq(pufeth.balanceOf(alice), 9 ether);
        assertEq(pufeth.balanceOf(address(unstake)), 1 ether);
        assertEq(unstake.ethReserve(), 5 ether - 1.04 ether);
    }

    function testUnstakeRevertsOnZero() public {
        vm.startPrank(alice);
        pufeth.approve(address(unstake), 1 ether);
        vm.expectRevert(MockEthUnstake.ZeroAmount.selector);
        unstake.unstakeETH(0);
        vm.stopPrank();
    }

    function testUnstakeRevertsOnInsufficientLiquidity() public {
        // 5 ETH 储备 ÷ 1.04 ≈ 4.807 pufETH，超过即应 revert
        pufeth.mint(alice, 100 ether);
        vm.startPrank(alice);
        pufeth.approve(address(unstake), 100 ether);
        // 100 * 1.04 = 104 ether > 5 ether reserve
        vm.expectRevert(
            abi.encodeWithSelector(MockEthUnstake.InsufficientLiquidity.selector, 104 ether, 5 ether)
        );
        unstake.unstakeETH(100 ether);
        vm.stopPrank();
    }

    function testUnstakeRevertsWithoutApproval() public {
        vm.prank(alice);
        // 没 approve，transferFrom 因为 allowance 不足 revert
        vm.expectRevert(); // MockPufETH 抛 InsufficientAllowance
        unstake.unstakeETH(1 ether);
    }

    function testReceiveFallback() public {
        uint256 before = unstake.ethReserve();
        (bool sent,) = address(unstake).call{value: 1 ether}('');
        assertTrue(sent);
        assertEq(unstake.ethReserve(), before + 1 ether);
    }

    function testOwnerCanWithdraw() public {
        uint256 before = address(this).balance;
        unstake.withdrawETH(2 ether);
        assertEq(address(this).balance, before + 2 ether);
    }

    function testNonOwnerCannotWithdraw() public {
        vm.prank(alice);
        vm.expectRevert(MockEthUnstake.NotOwner.selector);
        unstake.withdrawETH(1 ether);
    }

    function testOwnerCanSetRate() public {
        unstake.setRate(1.05e18);
        assertEq(unstake.rate(), 1.05e18);
        assertEq(unstake.quoteUnstake(1 ether), 1.05 ether);
    }

    function testNonOwnerCannotSetRate() public {
        vm.prank(alice);
        vm.expectRevert(MockEthUnstake.NotOwner.selector);
        unstake.setRate(2e18);
    }

    receive() external payable {}
}
