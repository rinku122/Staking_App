import { useEffect, useRef, useState } from "react";
import { useContract } from "../context/ContractContext";
import Transact from "./Transact";
import TransactionHistory from "./Transaction";
import { useWeb3 } from "../context/Web3Context";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DECIMALS,
  FROM_BLOCKNUMBER,
  STAKING_REWARD_CONTRACT_REWARD_ADDRESS,
} from "../Constants";
import BigNumber from "bignumber.js";
import { Circles } from "react-loader-spinner";

export interface Transaction {
  transactionHash: string;
  event: "Staked" | "Unstaked" | "RewardPaid";
  returnValues: { amount: string; time: string };
}

const Dashboard = ({ walletAddress }: { walletAddress: string }) => {
  const contracts = useContract();
  const { web3 }: any = useWeb3();
  const [loading, setloading] = useState(false);
  const timerRef = useRef<any>(null);

  const { rewardTokenContract, stakingTokenContract, stakingRewardsContract } =
    contracts;

  const [balancesAndStakes, setbalancesAndStakes] = useState({
    stakingTokenBal: "0",
    stake: "0",
    earned: "0",
    rewardTokenBal: "0",
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (
      !(rewardTokenContract && stakingTokenContract && stakingRewardsContract)
    )
      return;
    getBalancesAndStakes();
    getEarnedRewards();
    getTransaction();

    return () => clearInterval(timerRef.current);
  }, [contracts]);

  const getTransaction = async () => {
    try {
      const events = await stakingRewardsContract.getPastEvents("allEvents", {
        filter: { user: walletAddress },
        fromBlock: FROM_BLOCKNUMBER,
        toBlock: "latest",
      });

      setTransactions(events);
    } catch (error) {
      console.log(error);
    }
  };

  const getBalancesAndStakes = async () => {
    try {
      setloading(true);
      const [_rewardTokenBal, _stakingTokenBal, _stake, _earned] =
        await Promise.all([
          rewardTokenContract.methods.balanceOf(walletAddress).call(),
          stakingTokenContract.methods.balanceOf(walletAddress).call(),
          stakingRewardsContract.methods.balanceOf(walletAddress).call(),
          stakingRewardsContract.methods.earned(walletAddress).call(),
        ]);

      setbalancesAndStakes({
        ...balancesAndStakes,
        rewardTokenBal: _rewardTokenBal.toString(),
        stakingTokenBal: _stakingTokenBal.toString(),
        stake: _stake.toString(),
        earned: _earned.toString(),
      });
      setloading(false);
    } catch (error) {
      console.log(error);
      setloading(true);
    }
  };

  const getSomeStakingTokens = async () => {
    try {
      setloading(true);
      const tokenAmount = "10000000000000000000000";
      let gasPrice: any = await web3.eth.getGasPrice();
      gasPrice = Math.trunc((Number(gasPrice) * 150) / 100).toString();

      const gas = await stakingTokenContract.methods
        .mint(walletAddress, tokenAmount)
        .estimateGas({ from: walletAddress });
      await stakingTokenContract.methods
        .mint(walletAddress, tokenAmount)
        .send({ from: walletAddress, gasPrice, gas });
      const newBalance = await stakingTokenContract.methods
        .balanceOf(walletAddress)
        .call();
      setbalancesAndStakes({
        ...balancesAndStakes,
        stakingTokenBal: newBalance.toString(),
      });
      setloading(false);
      toast.dismiss();
      toast.success("Staking Tokens addedd to Wallet...");
    } catch (error: any) {
      console.log(error.message);
      toast.error(error.message);
      setloading(false);
    }
  };

  const getEarnedRewards = async () => {
    try {
      timerRef.current = setInterval(async () => {
        const _earned = await stakingRewardsContract.methods
          .earned(walletAddress)
          .call();

        setbalancesAndStakes((_balancesAndStakes) => ({
          ..._balancesAndStakes,
          earned: _earned.toString(),
        }));
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const handleTokens = async (amount: any, action: "stake" | "unstake") => {
    try {
      toast.dismiss();
      setloading(true);
      let gasPrice: any = await web3.eth.getGasPrice();
      gasPrice = Math.trunc((Number(gasPrice) * 150) / 100).toString();

      if (action === "stake") {
        const allowance = await stakingTokenContract.methods
          .allowance(walletAddress, STAKING_REWARD_CONTRACT_REWARD_ADDRESS)
          .call();

        if (allowance.toString() === "0") await getInfinitAllowance();
      }

      amount = new BigNumber(amount)
        .multipliedBy(new BigNumber(10 ** DECIMALS))
        .toFixed();

      const method = action === "stake" ? "stake" : "unstake";
      const gas = await stakingRewardsContract.methods[method](
        amount
      ).estimateGas({ from: walletAddress });

      await stakingRewardsContract.methods[method](amount).send({
        from: walletAddress,
        gasPrice,
        gas,
      });

      await getTransaction();

      const [newBalance, stakingBalance] = await Promise.all([
        stakingRewardsContract.methods.balanceOf(walletAddress).call(),
        stakingTokenContract.methods.balanceOf(walletAddress).call(),
      ]);

      setbalancesAndStakes({
        ...balancesAndStakes,
        stake: newBalance.toString(),
        stakingTokenBal: stakingBalance.toString(),
      });
      setloading(false);
      toast.success(`Token ${action === "stake" ? "Staked" : "Unstaked"}...`);
    } catch (error: any) {
      console.log(error);
      if (error.message.includes("Transaction has been reverted by the EVM")) {
        toast.error("Something went wrong, Please try again");
        setloading(false);
        return;
      }
      toast.error(error.message);
      setloading(false);
    }
  };

  const redeemRewards = async () => {
    try {
      toast.dismiss();
      setloading(true);
      let gasPrice: any = await web3.eth.getGasPrice();
      gasPrice = Math.trunc((Number(gasPrice) * 150) / 100).toString();
      const gas = await stakingRewardsContract.methods
        .redeemRewards()
        .estimateGas({
          from: walletAddress,
        });

      await stakingRewardsContract.methods.redeemRewards().send({
        from: walletAddress,
        gasPrice,
        gas,
      });

      await getTransaction();

      const [balance, earned] = await Promise.all([
        rewardTokenContract.methods.balanceOf(walletAddress).call(),
        stakingRewardsContract.methods.earned(walletAddress).call(),
      ]);

      setbalancesAndStakes({
        ...balancesAndStakes,
        rewardTokenBal: balance.toString(),
        earned: earned.toString(),
      });

      setloading(false);
      toast.success(`Rewards Redeemed Successfully...`);
    } catch (error: any) {
      console.log(error);
      if (error.message.includes("Transaction has been reverted by the EVM")) {
        toast.error("Something went wrong, Please try again");
        setloading(false);
        return;
      }
      toast.error(error.message);
      setloading(false);
    }
  };

  const getInfinitAllowance = async () => {
    try {
      const maxAllowance =
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
      let gasPrice: any = await web3.eth.getGasPrice();
      gasPrice = Math.trunc((Number(gasPrice) * 150) / 100).toString();

      const gas = await stakingTokenContract.methods
        .approve(STAKING_REWARD_CONTRACT_REWARD_ADDRESS, maxAllowance)
        .estimateGas({ from: walletAddress });
      await stakingTokenContract.methods
        .approve(STAKING_REWARD_CONTRACT_REWARD_ADDRESS, maxAllowance)
        .send({ from: walletAddress, gasPrice, gas });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="dashboard">
      {loading && (
        <div className="loader-overlay">
          <Circles
            height="80"
            width="80"
            color="white"
            ariaLabel="loading"
            wrapperStyle={{}}
            wrapperClass="grid-wrapper"
          />
        </div>
      )}
      <Transact
        balancesAndStakes={balancesAndStakes}
        getSomeStakingTokens={getSomeStakingTokens}
        handleTokens={handleTokens}
        getRewards={redeemRewards}
      />
      <TransactionHistory
        transactions={transactions}
        walletAddress={walletAddress}
        balancesAndStakes={balancesAndStakes}
      />
    </div>
  );
};

export default Dashboard;
