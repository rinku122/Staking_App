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
      rewardToken.getAddress(),
      parseUnits("1") //1 token/sec
    );

    await rewardToken.mint(
      stakingRewards.getAddress(),
      parseUnits((ONE_DAY * 10).toString())
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

  describe("Staking Rewards", function () {
    it("Stake", async function () {
      const [_, user1, user2] = await hre.ethers.getSigners();

      const { rewardToken, stakingRewards, stakingToken } = await loadFixture(
        getContracts
      );
      await stakingRewards.connect(user1).stake(parseUnits("100"));
      expect(await stakingRewards.balanceOf(user1.address)).equals(
        parseUnits("100")
      );
      await stakingRewards.connect(user1).stake(parseUnits("200"));
      expect(await stakingRewards.balanceOf(user1.address)).equals(
        parseUnits("300")
      );
    });

    it("Unstake", async function () {
      const [_, user1, user2] = await hre.ethers.getSigners();

      const { rewardToken, stakingRewards, stakingToken } = await loadFixture(
        getContracts
      );
      await stakingRewards.connect(user1).stake(parseUnits("500"));
      expect(await stakingRewards.balanceOf(user1.address)).equals(
        parseUnits("500")
      );
      await stakingRewards.connect(user1).unstake(parseUnits("200"));
      expect(await stakingRewards.balanceOf(user1.address)).equals(
        parseUnits("300")
      );

      await stakingRewards.connect(user1).unstake(parseUnits("200"));
      expect(await stakingRewards.balanceOf(user1.address)).equals(
        parseUnits("100")
      );

      await stakingRewards.connect(user1).unstake(parseUnits("100"));
      expect(await stakingRewards.balanceOf(user1.address)).equals(
        parseUnits("0")
      );
    });

    it("Reward Distribution", async function () {
      const [_, user1, user2] = await hre.ethers.getSigners();

      const { rewardToken, stakingRewards, stakingToken } = await loadFixture(
        getContracts
      );
      await stakingRewards.connect(user1).stake(parseUnits("100"));
      await time.increase(1);

      await stakingRewards.connect(user1).stake(parseUnits("100"));
      await time.increase(1);

      await stakingRewards.connect(user1).stake(parseUnits("100"));
      await time.increase(1);

      await stakingRewards.connect(user1).stake(parseUnits("100"));
      await time.increase(1);

      await stakingRewards.connect(user1).stake(parseUnits("100"));
      await time.increase(1);

      await stakingRewards.connect(user1).stake(parseUnits("100"));
      await time.increase(1);

      await stakingRewards.connect(user1).redeemRewards();

      expect(await rewardToken.balanceOf(user1.address)).equals(
        5999999999999999500n
      ); //Approx 6 days withdrwal getting 6 tokens

      await time.increase(3);

      await stakingRewards.connect(user1).redeemRewards();
      expect(await rewardToken.balanceOf(user1.address)).equals(
        8999999999999999500n
      ); //On 9th day getting 3 tokens again

      await stakingRewards.connect(user1).stake(parseUnits("100"));
      expect(await stakingRewards.earned(user1.address)).equal(0n);
      await time.increase(2);

      expect(await stakingRewards.earned(user1.address)).equal(
        1999999999999999900n
      );

      await stakingRewards.connect(user1).redeemRewards();

      expect(await rewardToken.balanceOf(user1.address)).equals(
        10999999999999999400n
      ); //On 11tokens balance of user1

      await stakingRewards.connect(user2).stake(parseUnits("100"));

      await time.increase(1);

      // User1 has now 700 stake and user2 has 100

      expect(await stakingRewards.earned(user1.address)).equals(
        875000000000000000n
      );
      expect(await stakingRewards.earned(user2.address)).equals(
        125000000000000000n
      );

      await stakingRewards.connect(user1).redeemRewards();
      await stakingRewards.connect(user2).redeemRewards();

      expect(await rewardToken.balanceOf(user1.address)).equals(
        11874999999999999400n
      );
      expect(await rewardToken.balanceOf(user2.address)).equals(
        125000000000000000n
      );

      await stakingRewards.connect(user1).unstake(parseUnits("600"));
      await stakingRewards.connect(user2).stake(parseUnits("600"));
      await time.increase(1);

      // //Reverse the case , user has now 100 stake and user2 has 700

      expect(await stakingRewards.earned(user1.address)).equals(
        125000000000000000n
      );

      expect(await stakingRewards.earned(user2.address)).equals(
        875000000000000000n
      );

      await stakingRewards.connect(user1).redeemRewards();
      await stakingRewards.connect(user2).redeemRewards();

      await stakingRewards.connect(user1).stake(parseUnits("300"));
      await stakingRewards.connect(user2).unstake(parseUnits("300"));

      await time.increase(1);

      //Now both users have same stake so they should get same amount of reward

      expect(await stakingRewards.earned(user1.address)).equals(
        500000000000000000n
      );

      expect(await stakingRewards.earned(user2.address)).equals(
        500000000000000000n
      );
    });
  });
});
