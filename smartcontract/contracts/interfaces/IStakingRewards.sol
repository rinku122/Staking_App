// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStakingRewards {
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
}
