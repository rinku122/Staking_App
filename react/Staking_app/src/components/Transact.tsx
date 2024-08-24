import { useState } from "react";
import "../Transact.css";
import BigNumber from "bignumber.js";
import { DECIMALS } from "../Constants";

const disableBtnStyle = {
  opacity: "0.5",
  backgroundColor: "#6c757d",
  cursor: "not-allowed",
  color: "#ccc",
};

const Transact = ({
  getSomeStakingTokens,
  loading,
  balancesAndStakes,
  handleTokens,
  getRewards,
}: {
  getSomeStakingTokens: () => void;
  getRewards: () => void;
  handleTokens: (amount: string, action: "unstake" | "stake") => void;
  loading: boolean;
  balancesAndStakes: {
    rewardTokenBal: string;
    stakingTokenBal: string;
    earned: string;
    stake: string;
  };
}) => {
  const [formValues, setFormValue] = useState<{
    stakeAmount: string;
    unStakeAmount: string;
  }>({
    stakeAmount: "",
    unStakeAmount: "",
  });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (/^\d*\.?\d*$/.test(value)) {
      setFormValue({
        ...formValues,
        [name]: value,
      });
    }
  };

  const { stakeAmount, unStakeAmount } = formValues;
  const { stakingTokenBal, stake, earned } = balancesAndStakes;

  const allowed = (desiredAmount: string, maxAmount: string): boolean => {
    if (!desiredAmount) return true;

    return new BigNumber(desiredAmount)
      .multipliedBy(new BigNumber(10 ** DECIMALS))
      .isGreaterThan(new BigNumber(maxAmount));
  };

  return (
    <div className="transact-container">
      <h3 className="transact-title">Stake Tokens</h3>
      <input
        onChange={(e) => handleInput(e)}
        value={stakeAmount}
        inputMode="numeric"
        placeholder="Amount to stake"
        className="styled-input"
        name="stakeAmount"
      />
      <button
        style={allowed(stakeAmount, stakingTokenBal) ? disableBtnStyle : {}}
        onClick={() => {
          handleTokens(stakeAmount, "stake");
          setFormValue({
            ...formValues,
            stakeAmount: "",
          });
        }}
        disabled={allowed(stakeAmount, stakingTokenBal)}
        className="styled-button"
      >
        Stake
      </button>
      <div className="unstake-section">
        <h3 className="transact-title">Unstake Tokens</h3>
        <input
          pattern="[0-9]*"
          placeholder="Amount to unstake"
          className="styled-input"
          name="unStakeAmount"
          onChange={(e) => handleInput(e)}
          value={unStakeAmount}
        />
        <button
          style={allowed(unStakeAmount, stake) ? disableBtnStyle : {}}
          disabled={allowed(unStakeAmount, stake)}
          className="styled-button"
          onClick={() => {
            handleTokens(unStakeAmount, "unstake");
            setFormValue({
              ...formValues,
              unStakeAmount: "",
            });
          }}
        >
          Unstake
        </button>
        <button
          style={allowed("0", earned) ? disableBtnStyle : {}}
          disabled={allowed("0", earned)}
          className="styled-button"
          onClick={getRewards}
        >
          Redeem Rewards
        </button>
        <button
          onClick={getSomeStakingTokens}
          style={{ background: "#45a049" }}
          className="styled-button"
        >
          {loading ? "Please Wait..." : "Get Some Token to Stake"}
        </button>
      </div>
    </div>
  );
};

export default Transact;
