// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IStakingRewards} from "./interfaces/IStakingRewards.sol";

contract StakingRewards is  IStakingRewards{
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    /**
    * Stakers Info
    */
    struct Staker {
        uint256 amount; 
        uint256 rewardDebt; 
        uint256 toPay; 
    }
    
    mapping(address => Staker) public staker;              // Mapping for Staker Info     
    uint256 public rewardTokenPerShare;                    // Reward Tokens/Staking Token 
    uint256 public lastTimeStamp;                          // LastTime for stake/unstake/redeemRewards
    uint256 public rewardRate;                             //Reward Rate (Tokens/sec)


    constructor(IERC20 _stakingToken, IERC20 _rewardsToken, uint256 _rewardRate){
        rewardRate = _rewardRate;
        stakingToken = _stakingToken;
        rewardsToken = _rewardsToken;
    }

     /**
     * @dev This function allows a user to stake their tokens. It calculates the pending rewards and updates the reward debt accordingly. 
     * The function checks if there are any pending rewards by calculating ((user.amount * (rewardTokenPerShare)) / 1e18) - (user.rewardDebt). 
     * If there are, it increases user's toPay by that amount. It then updates the staker's amount and reward debt. 
     * The function reverts if _amount is zero.
     * @param _amount Amount of tokens to stake.
     */

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

     /**
     * @dev This function allows a user to unstake their tokens. 
     * It first calculates any pending rewards by calculating ((user.amount * (rewardTokenPerShare)) / 1e18) - (user.rewardDebt). 
     * If there are, it transfers them to the user's address and updates user's toPay accordingly. 
     * It then updates staker's amount and reward debt. The function reverts if _amount is greater than the staker's current balance.
     * @param _amount Amount of tokens to unstake.
     */

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

    /**
     * @dev This function allows a user to claim their pending rewards. 
     * It first calculates any pending rewards by calculating ((user.amount * (rewardTokenPerShare)) / 1e18) - (user.rewardDebt). 
     * If there are, it transfers them to the user's address and updates user's toPay to zero.
     */

    function redeemRewards() external {
        updateRewardPool();
        Staker storage user = staker[msg.sender];
        uint256 rewardsAccumulated = earned(msg.sender);
        if(rewardsAccumulated <= 0) return;
        user.rewardDebt = user.amount * rewardTokenPerShare /1e18;
        user.toPay = 0;
        rewardsToken.transfer(msg.sender, rewardsAccumulated);
        emit RewardPaid(msg.sender, rewardsAccumulated, block.timestamp);
        
    }

    /**
     * @dev This view function returns the amount of rewards a staker has earned based on their current balance and reward debt. 
     * It also updates the reward token per share if necessary. The updated reward token per share is returned along with the earned rewards.
     * @param _user Address of the staker.
     * @return Amount of rewards earned by the user.
     */

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


    /**
     * @dev This internal function updates the reward pool by calculating new rewards and updating the reward token per share. 
     * It does not return anything as it should only be called internally.
     */

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

    /**
     * @dev This view function returns the current balance of a staker. 
     * @param account Address of the staker.
     * @return Amount of tokens staked by the user.
     */

    function balanceOf(address account) external view returns (uint256) {
        return staker[account].amount;
    }
}
