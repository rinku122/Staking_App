import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers";
import hre from "hardhat";

const ONE_DAY = 86400;

describe("Deploy Tokens", function () {
  async function getContracts() {
    const [owner, user1, user2] = await hre.ethers.getSigners();

    const RewardToken = await hre.ethers.getContractFactory("RewardToken");
    const rewardToken = await RewardToken.deploy(owner.address);

    const StakingToken = await hre.ethers.getContractFactory("StakingToken");
    const stakingToken = await StakingToken.deploy();

    const StakingRewards = await hre.ethers.getContractFactory(
      "StakingRewards"
    );

    const stakingRewards = await StakingRewards.deploy(
      stakingToken.getAddress(),
      rewardToken.getAddress()
    );

    await rewardToken.mint(
      stakingRewards.getAddress(),
      parseUnits((ONE_DAY * 10).toString())
    );

    await stakingRewards.addRewardToken(
      parseUnits((ONE_DAY * 10).toString()),
      ONE_DAY * 10
    );

    await stakingToken.connect(user1).mint(user1.address, parseUnits("50000"));

    await stakingToken.connect(user2).mint(user2.address, parseUnits("50000"));

    await stakingToken
      .connect(user1)
      .approve(await stakingRewards.getAddress(), parseUnits("50000"));

    await stakingToken
      .connect(user2)
      .approve(await stakingRewards.getAddress(), parseUnits("50000"));

    return { stakingRewards, rewardToken, stakingToken };
  }

  describe("Rewards Staking", function () {
    it("Stake", async function () {
      const [owner, user1, user2] = await hre.ethers.getSigners();

      const { rewardToken, stakingRewards, stakingToken } = await loadFixture(
        getContracts
      );

      await stakingRewards.connect(user1).stake(parseUnits("100"));

      await time.increase(ONE_DAY);

      await stakingRewards.connect(user1).stake(parseUnits("100"));

      await time.increase(ONE_DAY);

      await stakingRewards.connect(user2).stake(parseUnits("100"));

      await time.increase(ONE_DAY);

      let user1_reward = await stakingRewards.earned(user1.address);
      let user2_reward = await stakingRewards.earned(user2.address);

      expect(user1_reward.toString()).to.be.equals("230402000000000000000000");
      expect(user2_reward.toString()).to.be.equals("28800000000000000000000");

      await stakingRewards.connect(user1).stake(parseUnits("100"));

      await time.increase(ONE_DAY);

      user1_reward = await stakingRewards.earned(user1.address);
      user2_reward = await stakingRewards.earned(user2.address);

      expect(user1_reward.toString()).to.be.equals("295202666666666666666600");
      expect(user2_reward.toString()).to.be.equals("50400333333333333333300");
    });

    it("Get Rewards", async function () {
      const [owner, user1, user2] = await hre.ethers.getSigners();

      const { rewardToken, stakingRewards, stakingToken } = await loadFixture(
        getContracts
      );

      await stakingRewards.connect(user1).stake(parseUnits("100"));

      await time.increase(ONE_DAY);

      const user1_Reward = await stakingRewards.earned(user1.address);

      expect(user1_Reward.toString()).to.be.equal("86400000000000000000000");

      expect(await rewardToken.balanceOf(user1.address)).to.be.equals(0);

      await stakingRewards.connect(user1).getReward();

      expect(await rewardToken.balanceOf(user1.address)).to.be.equals(
        "86401000000000000000000"
      );
    });

    it("Unstake", async function () {
      const [owner, user1, user2] = await hre.ethers.getSigners();

      const { rewardToken, stakingRewards, stakingToken } = await loadFixture(
        getContracts
      );

      await stakingRewards.connect(user1).stake(parseUnits("100"));

      await time.increase(ONE_DAY);

      await stakingRewards.connect(user1).stake(parseUnits("100"));

      await time.increase(ONE_DAY);

      await stakingRewards.connect(user2).stake(parseUnits("100"));

      await time.increase(ONE_DAY);

      let user1_reward = await stakingRewards.earned(user1.address);
      let user2_reward = await stakingRewards.earned(user2.address);

      expect(user1_reward.toString()).to.be.equals("230402000000000000000000");
      expect(user2_reward.toString()).to.be.equals("28800000000000000000000");

      await stakingRewards.connect(user1).unstake(parseUnits("150"));

      await time.increase(ONE_DAY);

      user1_reward = await stakingRewards.earned(user1.address);
      user2_reward = await stakingRewards.earned(user2.address);

      expect(user1_reward.toString()).to.be.equals("259202666666666666666600");
      expect(user2_reward.toString()).to.be.equals("86400333333333333333300");
    });
  });
});
