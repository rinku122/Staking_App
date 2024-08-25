import BigNumber from "bignumber.js";
import { DECIMALS } from "../Constants";

const TransactionHistory = ({
  walletAddress,
  balancesAndStakes,
}: {
  walletAddress: string;
  balancesAndStakes: {
    rewardTokenBal: string;
    stakingTokenBal: string;
    earned: string;
    stake: string;
  };
}) => {
  const transactions = [
    { id: 1, type: "Stake", amount: 100, date: "2024-08-21" },
    { id: 2, type: "Unstake", amount: 50, date: "2024-08-20" },
    { id: 3, type: "Reward", amount: 10, date: "2024-08-19" },
    { id: 4, type: "Stake", amount: 100, date: "2024-08-21" },
    { id: 5, type: "Unstake", amount: 50, date: "2024-08-20" },
    { id: 6, type: "Reward", amount: 10, date: "2024-08-19" },
    { id: 7, type: "Stake", amount: 100, date: "2024-08-21" },
    { id: 8, type: "Unstake", amount: 50, date: "2024-08-20" },
    { id: 9, type: "Reward", amount: 10, date: "2024-08-19" },
    { id: 10, type: "Stake", amount: 100, date: "2024-08-21" },
    { id: 11, type: "Unstake", amount: 50, date: "2024-08-20" },
    { id: 12, type: "Reward", amount: 10, date: "2024-08-19" },
    { id: 13, type: "Stake", amount: 100, date: "2024-08-21" },
    { id: 14, type: "Unstake", amount: 50, date: "2024-08-20" },
    { id: 15, type: "Reward", amount: 10, date: "2024-08-19" },
    { id: 16, type: "Stake", amount: 100, date: "2024-08-21" },
    { id: 17, type: "Unstake", amount: 50, date: "2024-08-20" },
    { id: 18, type: "Reward", amount: 10, date: "2024-08-19" },
  ];

  const { rewardTokenBal, stakingTokenBal, earned, stake } = balancesAndStakes;

  const parsevalue = (amount: string) => {
    return (
      Math.floor(
        new BigNumber(amount)
          .dividedBy(new BigNumber(10 ** DECIMALS))
          .toNumber() * 10000
      ) / 10000
    );
  };

  return (
    <div style={{ textAlign: "center" }} className="tx-table">
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          justifyItems: "center",
        }}
      >
        <div style={{ width: "100%", cursor: "false" }} className="styled-card">
          Connected Account : {walletAddress}
        </div>
      </div>
      <div style={{ width: "100%" }}>
        <div className="styled-card">
          Currently Staked in Contract : {parsevalue(stake)}
        </div>
        <div className="styled-card">
          Currently Rewards in Contract : {parsevalue(earned)}
        </div>
        <div className="styled-card">
          Stake Token in Wallet : {parsevalue(stakingTokenBal)}
        </div>
        <div className="styled-card">
          Reward Token in Wallet : {parsevalue(rewardTokenBal)}
        </div>
      </div>
      <h3>Transaction History</h3>
      <div className="tx-table-container">
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "center",
          }}
        >
          <thead>
            <tr>
              <th className="border">Type</th>
              <th className="border">Amount</th>
              <th className="border">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn) => (
              <tr key={txn.id}>
                <td className="border">{txn.type}</td>
                <td className="border">{txn.amount} tokens</td>
                <td className="border">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
