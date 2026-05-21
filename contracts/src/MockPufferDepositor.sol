// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Minimal IERC20 surface (transferFrom only, matches our mocks).
interface IMintableERC20 {
    function mint(address to, uint256 amount) external;
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

/// @notice Accepts ETH / stETH / wstETH and mints MockPufETH at a configurable rate.
/// @dev Must be set as a minter on MockPufETH before use. Sepolia demo only.
///
/// Conversion model (mirrors Puffer mainnet rate ~0.96 pufETH per ETH):
///   pufETHOut = inputAmount * rate / 1e18
contract MockPufferDepositor {
    IMintableERC20 public immutable pufETH;
    IMintableERC20 public immutable stETH;
    IMintableERC20 public immutable wstETH;

    /// @notice pufETH per 1 input token, scaled to 1e18.
    /// 0.96e18 means 1 input -> 0.96 pufETH (matches mainnet roughly).
    uint256 public constant ethRate = 0.96e18;
    uint256 public constant stethRate = 0.96e18;
    uint256 public constant wstethRate = 1.12e18;

    event Deposited(
        address indexed user,
        address indexed inputToken,
        uint256 inputAmount,
        uint256 pufETHMinted
    );

    error ZeroAmount();
    error TransferFailed();

    /// @param pufETH_ MockPufETH address
    /// @param stETH_ MockStETH address
    /// @param wstETH_ MockWstETH address
    constructor(address pufETH_, address stETH_, address wstETH_) {
        pufETH = IMintableERC20(pufETH_);
        stETH = IMintableERC20(stETH_);
        wstETH = IMintableERC20(wstETH_);
    }

    /// @notice Deposit ETH, receive pufETH at ethRate.
    function depositETH() external payable returns (uint256 pufETHOut) {
        if (msg.value == 0) revert ZeroAmount();
        pufETHOut = (msg.value * ethRate) / 1e18;
        pufETH.mint(msg.sender, pufETHOut);
        emit Deposited(msg.sender, address(0), msg.value, pufETHOut);
    }

    /// @notice Deposit stETH, receive pufETH at stethRate. Requires prior approval.
    function depositStETH(uint256 amount) external returns (uint256 pufETHOut) {
        if (amount == 0) revert ZeroAmount();
        if (!stETH.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        pufETHOut = (amount * stethRate) / 1e18;
        pufETH.mint(msg.sender, pufETHOut);
        emit Deposited(msg.sender, address(stETH), amount, pufETHOut);
    }

    /// @notice Deposit wstETH, receive pufETH at wstethRate. Requires prior approval.
    function depositWstETH(uint256 amount) external returns (uint256 pufETHOut) {
        if (amount == 0) revert ZeroAmount();
        if (!wstETH.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();
        pufETHOut = (amount * wstethRate) / 1e18;
        pufETH.mint(msg.sender, pufETHOut);
        emit Deposited(msg.sender, address(wstETH), amount, pufETHOut);
    }

    /// @notice Compute the pufETH output for a given input without executing the deposit.
    /// @dev Useful for the frontend's simulation layer (eth_call before sign).
    function quoteETH(uint256 amount) external pure returns (uint256) {
        return (amount * ethRate) / 1e18;
    }

    function quoteStETH(uint256 amount) external pure returns (uint256) {
        return (amount * stethRate) / 1e18;
    }

    function quoteWstETH(uint256 amount) external pure returns (uint256) {
        return (amount * wstethRate) / 1e18;
    }

    receive() external payable {}
}
