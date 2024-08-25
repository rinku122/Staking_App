import BigNumber from "bignumber.js";
import { DECIMALS, SEPLOIA_EXPLORER } from "../Constants";
import { Transaction } from "./Dashboard";
import { Fragment } from "react/jsx-runtime";

const TransactionHistory = ({
  walletAddress,
  balancesAndStakes,
  transactions,
}: {
  walletAddress: string;
  transactions: Transaction[];
  balancesAndStakes: {
    rewardTokenBal: string;
    stakingTokenBal: string;
    earned: string;
    stake: string;
  };
}) => {
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

  const shortenHash = (hash: string) => {
    if (hash.length <= 10) return hash;

    const start = hash.slice(0, 5);
    const end = hash.slice(-3);
    return `${start}...${end}`;
  };

  function formatTimestamp(timestamp: number) {
    const date = new Date(timestamp * 1000);

    const options: any = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };

    return date.toLocaleString(undefined, options);
  }

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
      {transactions.length > 0 && (
        <Fragment>
          <h3>My Transaction History</h3>
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
                  <th className="border">Reward Tokens</th>
                  <th className="border">Date</th>
                  <th className="border">Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn: Transaction) => (
                  <tr key={txn.transactionHash}>
                    <td className="border">
                      {txn.event === "RewardPaid"
                        ? "Rewards Withdrawn"
                        : txn.event}
                    </td>
                    <td className="border">
                      {parsevalue(txn.returnValues.amount.toString())}
                    </td>
                    <td className="border">
                      {formatTimestamp(Number(txn.returnValues.time))}
                    </td>
                    <td className="border">
                      <a
                        target="_blank"
                        href={`${SEPLOIA_EXPLORER}${txn.transactionHash}`}
                      >
                        {shortenHash(txn.transactionHash)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Fragment>
      )}
    </div>
  );
};

export default TransactionHistory;
