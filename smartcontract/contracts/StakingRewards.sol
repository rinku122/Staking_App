// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IStakingRewards} from "./interfaces/IStakingRewards.sol";

contract StakingRewards is ReentrancyGuard, IStakingRewards{
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    address public rewardDistributor;
    uint256 public expireAt;
    uint256 public lastUpdatedIt;
    uint256 public rate_per_sec;
    uint256 public rewardPerTokenStored;

    struct Stake {
        uint256 amount;
        uint256 rewardDebt;
        uint256 accumlatedReward;
    }

    mapping(address => Stake) stakers;


    uint256 public totalSupply;

    constructor(IERC20 _stakingToken, IERC20 _rewardToken) {
        rewardsToken = _rewardToken;
        stakingToken = _stakingToken;
        rewardDistributor = msg.sender;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return expireAt <= block.timestamp ? expireAt : block.timestamp;
    }

    

    function stake(uint256 _amount) external nonReentrant updateReward(msg.sender)  {
        require(_amount > 0, "StakingRewards:V1::Invalid Amount");
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        stakers[msg.sender].amount += _amount;
        totalSupply += _amount;
        emit Staked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external nonReentrant updateReward(msg.sender){
        require(_amount > 0, "StakingRewards:V1::Invalid Amount");
        stakers[msg.sender].amount -= _amount;
        totalSupply -= _amount;
        stakingToken.transfer(msg.sender, _amount);
        emit Unstaked(msg.sender, _amount);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply == 0) {
            return rewardPerTokenStored;
        }

        return rewardPerTokenStored
            + (rate_per_sec * (lastTimeRewardApplicable() - lastUpdatedIt) * 1e18)
                / totalSupply;
    }

    function earned(address _account) public view returns (uint256) {
        return (
            (
                stakers[_account].amount
                    * (rewardPerToken() - stakers[_account].rewardDebt)
            ) / 1e18
        ) + stakers[_account].accumlatedReward;
    }

    function getReward() external updateReward(msg.sender) {
        uint256 reward = stakers[msg.sender].accumlatedReward;
        if (reward > 0) {
            stakers[msg.sender].accumlatedReward = 0;
            rewardsToken.transfer(msg.sender, reward);
        }
        emit RewardPaid(msg.sender, reward);
    }

   
    function addRewardToken(uint256 _amount, uint256 duration)
        external
        onlyRewardDistributor
        nonReentrant
        updateReward(address(0))
    {
        if (block.timestamp >= expireAt) {
            rate_per_sec = _amount / duration;
        } else {
            uint256 remainingRewards = (expireAt - block.timestamp) * rate_per_sec;
            rate_per_sec = (_amount + remainingRewards) / duration;
        }

        require(rate_per_sec > 0, "StakingRewards:V1::RewardRate Cant't be zero");
        require(
            rate_per_sec * duration <= rewardsToken.balanceOf(address(this)),
            "StakingRewards:V1::Reward should be greater then bal"
        );

        expireAt = block.timestamp + duration;
        lastUpdatedIt = block.timestamp;
    }

    function balanceOf(address account) external view returns (uint256) {
        return stakers[account].amount;
    }


    modifier onlyRewardDistributor() {
        require(msg.sender == rewardDistributor, "StakingRewards:V1::Only Owner");
        _;
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdatedIt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            stakers[_account].accumlatedReward = earned(_account);
            stakers[_account].rewardDebt = rewardPerTokenStored;
        }
        _;
    }

}


