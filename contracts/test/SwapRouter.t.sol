// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockPufETH} from "../src/MockPufETH.sol";
import {MockStETH} from "../src/MockStETH.sol";
import {MockWstETH} from "../src/MockWstETH.sol";
import {MockSwapRouter} from "../src/MockSwapRouter.sol";

contract SwapRouterTest is Test {
    MockPufETH pufeth;
    MockStETH steth;
    MockWstETH wsteth;
    MockSwapRouter router;

    address alice = address(0xA11CE);

    function setUp() public {
        pufeth = new MockPufETH();
        steth = new MockStETH();
        wsteth = new MockWstETH();
        router = new MockSwapRouter();

        // Authorize router to mint pufETH and wstETH
        pufeth.setMinter(address(router), true);
        wsteth.setMinter(address(router), true);

        // Set rates:
        //   stETH -> pufETH at 0.96  (single-hop direct)
        //   stETH -> wstETH at 0.83  (wsETH worth more, so you get less)
        //   wstETH -> pufETH at 1.12 (wstETH worth more in pufETH terms)
        router.setRate(address(steth), address(pufeth), 0.96e18);
        router.setRate(address(steth), address(wsteth), 0.83e18);
        router.setRate(address(wsteth), address(pufeth), 1.12e18);

        // Fund Alice with input tokens
        vm.startPrank(alice);
        steth.faucetMint(100 ether);
        steth.approve(address(router), type(uint256).max);
        wsteth.faucetMint(100 ether);
        wsteth.approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    /// Single-hop swaps

    function test_singleHop_stETHToPufETH() public {
        address[] memory path = new address[](2);
        path[0] = address(steth);
        path[1] = address(pufeth);

        vm.prank(alice);
        uint256 amountOut = router.swapExactTokensForTokens(10 ether, 9 ether, path);

        assertEq(amountOut, 9.6 ether);
        assertEq(pufeth.balanceOf(alice), 9.6 ether);
        assertEq(steth.balanceOf(alice), 90 ether);
    }

    function test_quote_matchesActualSwap() public {
        address[] memory path = new address[](2);
        path[0] = address(steth);
        path[1] = address(pufeth);

        uint256 expectedOut = router.quote(10 ether, path);
        vm.prank(alice);
        uint256 actualOut = router.swapExactTokensForTokens(10 ether, 0, path);
        assertEq(expectedOut, actualOut);
    }

    /// Multi-hop swap — stETH -> wstETH -> pufETH

    function test_multiHop_appliesRatesSequentially() public {
        address[] memory path = new address[](3);
        path[0] = address(steth);
        path[1] = address(wsteth);
        path[2] = address(pufeth);

        // 10 stETH -> 10 * 0.83 = 8.3 wstETH -> 8.3 * 1.12 = 9.296 pufETH
        vm.prank(alice);
        uint256 amountOut = router.swapExactTokensForTokens(10 ether, 9 ether, path);

        assertEq(amountOut, 9.296 ether);
        assertEq(pufeth.balanceOf(alice), 9.296 ether);
    }

    /// Slippage protection

    function test_slippage_rejectsWhenOutputBelowMin() public {
        address[] memory path = new address[](2);
        path[0] = address(steth);
        path[1] = address(pufeth);

        vm.prank(alice);
        // Asking for 100 pufETH on 10 stETH input — won't satisfy
        vm.expectRevert(
            abi.encodeWithSelector(MockSwapRouter.InsufficientOutput.selector, 9.6 ether, 100 ether)
        );
        router.swapExactTokensForTokens(10 ether, 100 ether, path);
    }

    /// Validation

    function test_rejectsZeroAmount() public {
        address[] memory path = new address[](2);
        path[0] = address(steth);
        path[1] = address(pufeth);

        vm.prank(alice);
        vm.expectRevert(MockSwapRouter.ZeroAmount.selector);
        router.swapExactTokensForTokens(0, 0, path);
    }

    function test_rejectsShortPath() public {
        address[] memory path = new address[](1);
        path[0] = address(steth);

        vm.prank(alice);
        vm.expectRevert(MockSwapRouter.InvalidPath.selector);
        router.swapExactTokensForTokens(10 ether, 0, path);
    }

    function test_rejectsMissingRate() public {
        // pufETH -> stETH was never configured
        address[] memory path = new address[](2);
        path[0] = address(pufeth);
        path[1] = address(steth);

        // First give alice some pufETH
        pufeth.mint(alice, 10 ether);
        vm.prank(alice);
        pufeth.approve(address(router), type(uint256).max);

        vm.prank(alice);
        vm.expectRevert(MockSwapRouter.RateNotSet.selector);
        router.swapExactTokensForTokens(5 ether, 0, path);
    }

    /// Rate setting

    function test_onlyOwnerCanSetRate() public {
        vm.prank(alice);
        vm.expectRevert(MockSwapRouter.NotOwner.selector);
        router.setRate(address(steth), address(pufeth), 1e18);
    }

    function test_setRatesBatchWorks() public {
        address[] memory tokenIns = new address[](2);
        address[] memory tokenOuts = new address[](2);
        uint256[] memory rates = new uint256[](2);
        tokenIns[0] = address(pufeth);
        tokenOuts[0] = address(steth);
        rates[0] = 1.04e18;
        tokenIns[1] = address(pufeth);
        tokenOuts[1] = address(wsteth);
        rates[1] = 0.89e18;

        router.setRates(tokenIns, tokenOuts, rates);
        assertEq(router.rate(address(pufeth), address(steth)), 1.04e18);
        assertEq(router.rate(address(pufeth), address(wsteth)), 0.89e18);
    }
}
