import React, { createContext, useContext, useEffect, useState } from "react";
import { useWeb3 } from "./Web3Context";
import TokenAbi from "./../bin/TokenAbi.json";
import StakingRewardsAbi from "./../bin/StakingRewards.json";
import {
  REWARD_CONTRACT_ADDRESS,
  STAKING_REWARD_CONTRACT_REWARD_ADDRESS,
  STAKING__CONTRACT_ADDRESS,
} from "../Constants";

// Define the type for the Contract context.
//This will return the instances of all contract that will get used
type ContractContextType = {
  rewardTokenContract: any | null;
  stakingTokenContract: any | null;
  stakingRewardsContract: any | null;
};

const ContractContext = createContext<ContractContextType>({
  rewardTokenContract: null,
  stakingTokenContract: null,
  stakingRewardsContract: null,
});

export const useContract = () => useContext(ContractContext);

export const ContractProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { web3 }: any = useWeb3();
  const [rewardTokenContract, setRewardTokenContract] = useState<any | null>(
    null
  );
  const [stakingTokenContract, setStakingTokenContract] = useState<any | null>(
    null
  );

  const [stakingRewardsContract, setstakingRewardsContract] = useState<
    any | null
  >(null);

  const initilaizeContract = async () => {
    const _rewardTokenContract = new web3.eth.Contract(
      TokenAbi,
      REWARD_CONTRACT_ADDRESS
    );

    setRewardTokenContract(_rewardTokenContract);

    const _stakingTokenContract = new web3.eth.Contract(
      TokenAbi,
      STAKING__CONTRACT_ADDRESS
    );

    setStakingTokenContract(_stakingTokenContract);

    const _stakingRewardsContract = new web3.eth.Contract(
      StakingRewardsAbi,
      STAKING_REWARD_CONTRACT_REWARD_ADDRESS
    );

    setstakingRewardsContract(_stakingRewardsContract);
  };

  useEffect(() => {
    if (web3) {
      initilaizeContract();
    }
  }, [web3]);

  return (
    <ContractContext.Provider
      value={{
        rewardTokenContract: rewardTokenContract,
        stakingTokenContract: stakingTokenContract,
        stakingRewardsContract: stakingRewardsContract,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
