// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IMintableERC20 {
    function mint(address to, uint256 amount) external;
}

/// @notice Uniswap-V3-style multi-hop swap router (mock). Maintains per-pair conversion
/// rates and routes through `path[]`. The router must be authorized as a minter on the
/// final destination token. Input tokens are pulled via transferFrom and held by the
/// router (mock-only — no real liquidity pool).
///
/// Rates are 1e18-scaled (rate = 1e18 means 1:1 conversion).
contract MockSwapRouter {
    address public owner;
    mapping(address => mapping(address => uint256)) public rate;

    event RateUpdated(address indexed tokenIn, address indexed tokenOut, uint256 rate);
    event Swapped(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 hops
    );

    error NotOwner();
    error InvalidPath();
    error RateNotSet();
    error InsufficientOutput(uint256 amountOut, uint256 minAmountOut);
    error TransferFailed();
    error ZeroAmount();

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /// @notice Set the rate (1e18-scaled) for tokenIn -> tokenOut.
    function setRate(address tokenIn, address tokenOut, uint256 newRate) external onlyOwner {
        rate[tokenIn][tokenOut] = newRate;
        emit RateUpdated(tokenIn, tokenOut, newRate);
    }

    /// @notice Batch set rates for setup convenience. arrays must be equal length.
    function setRates(
        address[] calldata tokenIns,
        address[] calldata tokenOuts,
        uint256[] calldata newRates
    ) external onlyOwner {
        for (uint256 i = 0; i < tokenIns.length; i++) {
            rate[tokenIns[i]][tokenOuts[i]] = newRates[i];
            emit RateUpdated(tokenIns[i], tokenOuts[i], newRates[i]);
        }
    }

    /// @notice Compute the output for a given path (read-only — for frontend simulation).
    function quote(uint256 amountIn, address[] calldata path) public view returns (uint256) {
        if (path.length < 2) revert InvalidPath();
        uint256 amountOut = amountIn;
        for (uint256 i = 0; i < path.length - 1; i++) {
            uint256 r = rate[path[i]][path[i + 1]];
            if (r == 0) revert RateNotSet();
            amountOut = (amountOut * r) / 1e18;
        }
        return amountOut;
    }

    /// @notice Swap `amountIn` of path[0] for at least `minAmountOut` of path[last],
    /// routing through intermediate tokens.
    /// @param path Token sequence (length >= 2). First is input, last is output.
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 minAmountOut,
        address[] calldata path
    ) external returns (uint256 amountOut) {
        if (amountIn == 0) revert ZeroAmount();
        if (path.length < 2) revert InvalidPath();

        // Pull input from user
        if (!IERC20Minimal(path[0]).transferFrom(msg.sender, address(this), amountIn)) {
            revert TransferFailed();
        }

        // Apply each hop's rate
        amountOut = amountIn;
        for (uint256 i = 0; i < path.length - 1; i++) {
            uint256 r = rate[path[i]][path[i + 1]];
            if (r == 0) revert RateNotSet();
            amountOut = (amountOut * r) / 1e18;
        }

        // Enforce slippage
        if (amountOut < minAmountOut) revert InsufficientOutput(amountOut, minAmountOut);

        // Mint output to user (router must be authorized minter on path[last])
        IMintableERC20(path[path.length - 1]).mint(msg.sender, amountOut);

        emit Swapped(
            msg.sender,
            path[0],
            path[path.length - 1],
            amountIn,
            amountOut,
            path.length - 1
        );
    }

    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }
}
