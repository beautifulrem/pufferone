// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20Minimal {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/// @notice Sepolia demo only — instant pufETH → ETH unstake.
///
/// Production Puffer Finance routes ETH redemptions through a PufferVault
/// withdrawal queue (~1-2 weeks). For the testnet demo we collapse that into
/// an instant payout backed by ETH the contract owner pre-funded. Mirrors the
/// product user-flow without making the demo dependent on real validator
/// exits.
///
/// Conversion model:
///   ethOut = pufETHIn * rate / 1e18
///   default rate 1.04e18 reflects mainnet pufETH appreciation vs ETH.
contract MockEthUnstake {
    IERC20Minimal public immutable pufETH;
    address public owner;

    /// @notice ETH per 1 pufETH, scaled to 1e18. 1.04e18 = 1.04 ETH per pufETH.
    uint256 public rate = 1.04e18;

    event Unstaked(address indexed user, uint256 pufETHIn, uint256 ethOut);
    event RateUpdated(uint256 newRate);
    event Funded(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);

    error NotOwner();
    error ZeroAmount();
    error TransferFailed();
    error InsufficientLiquidity(uint256 needed, uint256 available);
    error EthSendFailed();

    /// @param pufETH_ MockPufETH 地址（受让方持有用户烧掉的 pufETH，可由 owner 后续提走）
    constructor(address pufETH_) payable {
        pufETH = IERC20Minimal(pufETH_);
        owner = msg.sender;
        if (msg.value > 0) emit Funded(msg.sender, msg.value);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    /// @notice Burn-equivalent: pull pufETH from user, pay ETH from contract balance.
    /// pufETH 没有 burn 方法，所以转给合约自己「锁定」，等价于退出循环。
    function unstakeETH(uint256 pufETHIn) external returns (uint256 ethOut) {
        if (pufETHIn == 0) revert ZeroAmount();
        ethOut = (pufETHIn * rate) / 1e18;
        uint256 balance = address(this).balance;
        if (ethOut > balance) revert InsufficientLiquidity(ethOut, balance);

        if (!pufETH.transferFrom(msg.sender, address(this), pufETHIn)) {
            revert TransferFailed();
        }
        (bool sent,) = msg.sender.call{value: ethOut}('');
        if (!sent) revert EthSendFailed();

        emit Unstaked(msg.sender, pufETHIn, ethOut);
    }

    /// @notice Compute ETH output for a given pufETH input (read-only — used by
    /// frontend `eth_call` simulate before signing).
    function quoteUnstake(uint256 pufETHIn) external view returns (uint256) {
        return (pufETHIn * rate) / 1e18;
    }

    /// @notice ETH 储备余额（前端可用来判断流动性是否充足）
    function ethReserve() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Owner 调整 rate，1e18 = 1:1
    function setRate(uint256 newRate) external onlyOwner {
        if (newRate == 0) revert ZeroAmount();
        rate = newRate;
        emit RateUpdated(newRate);
    }

    /// @notice Owner 提走 ETH（紧急 / 升级用）
    function withdrawETH(uint256 amount) external onlyOwner {
        (bool sent,) = owner.call{value: amount}('');
        if (!sent) revert EthSendFailed();
        emit Withdrawn(owner, amount);
    }

    /// @notice 接收 ETH 充值（任何人可充值流动性，方便 demo 中断后第三方补血）
    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }
}
