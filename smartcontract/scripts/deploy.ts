import { parseUnits } from "ethers";
import hre from "hardhat";

async function main() {
  const ONE_DAY = 86400;

  const [owner] = await hre.ethers.getSigners();

  //Deploying Tokens
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy(owner.address);

  const StakingToken = await hre.ethers.getContractFactory("StakingToken");
  const stakingToken = await StakingToken.deploy();

  const StakingRewards = await hre.ethers.getContractFactory("StakingRewards");

  const stakingRewards = await StakingRewards.deploy(
    stakingToken.getAddress(),
    rewardToken.getAddress(),
    parseUnits("1") //1 token/sec
  );

  //Minting Reward token to Staking Reward Fucntion
  await rewardToken.mint(
    stakingRewards.getAddress(),
    parseUnits((ONE_DAY * 10).toString())
  );

  console.log({
    rewardContract: await rewardToken.getAddress(),
    stakingContract: await stakingToken.getAddress(),
    stakingRewards: await stakingRewards.getAddress(),
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

//npx hardhat run scripts/deploy.ts --network sepolia
