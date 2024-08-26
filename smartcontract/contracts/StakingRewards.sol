// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IStakingRewards} from "./interfaces/IStakingRewards.sol";

contract StakingRewards is  IStakingRewards{
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    struct Staker {
        uint256 amount; 
        uint256 rewardDebt; 
        uint256 toPay; 
    }
    
    mapping(address => Staker) public staker;
    uint256 public rewardTokenPerShare;
    uint256 public lastTimeStamp;
    uint256 public rewardRate;


    constructor(IERC20 _stakingToken, IERC20 _rewardsToken, uint256 _rewardRate){
        rewardRate = _rewardRate;
        stakingToken = _stakingToken;
        rewardsToken = _rewardsToken;
    }


    function stake(uint256 _amount) external {
        require(_amount > 0, "Cant stake zero");
        updateRewardPool();
        Staker storage user = staker[msg.sender];
        if (user.amount > 0) {
            uint256 pending = ((user.amount * (rewardTokenPerShare)) / 1e18) - (user.rewardDebt);
            if (pending > 0) {
                user.toPay += pending;
            }
        }
        if (_amount > 0) {
            user.amount += _amount;
            stakingToken.transferFrom(msg.sender, address(this), _amount);
        }
        user.rewardDebt = user.amount * rewardTokenPerShare /1e18;
        emit Staked(msg.sender, _amount, block.timestamp);
    }

    function unstake(uint256 _amount) external {
        updateRewardPool();
        Staker storage user = staker[msg.sender];
        require(user.amount >= _amount, "Invalid Withdraw");

        uint256 pending = ((user.amount * (rewardTokenPerShare)) / 1e18) - (user.rewardDebt);
        if (pending > 0) {
            rewardsToken.transfer(msg.sender,pending);
            user.toPay += pending;

        }
        if (_amount > 0) {
            user.amount -= _amount;
            stakingToken.transfer(msg.sender, _amount);
        }
        user.rewardDebt = user.amount * rewardTokenPerShare /1e18;
        emit Unstaked(msg.sender, _amount, block.timestamp);
    }

    function redeemRewards() external {
        updateRewardPool();
        Staker storage user = staker[msg.sender];
        uint256 rewardsAccumulated = earned(msg.sender);
        if(rewardsAccumulated > 0){
            user.rewardDebt = user.amount * rewardTokenPerShare /1e18;
            user.toPay = 0;
            rewardsToken.transfer(msg.sender, rewardsAccumulated);
        }
    }


    function balanceOf(address account) external view returns (uint256) {
        return staker[account].amount;
    }



    function earned( address _user) public  view returns (uint256) {
        Staker storage user = staker[_user];
        uint256 _rewardTokenPerShare = rewardTokenPerShare;
        uint256 totalSupply = stakingToken.balanceOf(address(this));
        if (block.timestamp > lastTimeStamp && totalSupply != 0) {
            uint256 rewardToken = rewardRate * (block.timestamp - lastTimeStamp) * 1e18;
            _rewardTokenPerShare = rewardTokenPerShare  + (rewardToken / totalSupply);
        }
        return (((user.amount * _rewardTokenPerShare)/ 1e18) - (user.rewardDebt) + user.toPay);
    }

    function timestapm ()public view returns (uint256){
        return block.timestamp;
    }


    function updateRewardPool () internal  {
        if (block.timestamp <= lastTimeStamp) {
            return;
        }
        uint256 totalSupply = stakingToken.balanceOf(address(this));
        if (totalSupply == 0) {
            lastTimeStamp = block.timestamp;
            return;
        }
        uint rewardToken = rewardRate * (block.timestamp - lastTimeStamp) * 1e18;
        rewardTokenPerShare = rewardTokenPerShare  + (rewardToken/totalSupply);
        lastTimeStamp = block.timestamp;
    }
}