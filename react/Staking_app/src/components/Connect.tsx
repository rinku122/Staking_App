import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { useWeb3 } from "../context/Web3Context";

interface ConnectProps {
  setWalletAddress: (address: string) => void;
  walletAddress: string | null;
}

const Connect: React.FC<ConnectProps> = ({
  setWalletAddress,
  walletAddress,
}) => {
  const { initializeWeb3 } = useWeb3();

  useEffect(() => {
    if (walletAddress) initializeWeb3();
  }, []);

  const connectWallet = async () => {
    try {
      const { ethereum }: any = window;
      if (typeof ethereum !== "undefined") {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        let _walletAddress = accounts[0];
        setWalletAddress(_walletAddress);
        localStorage.setItem("walletAddress", _walletAddress);
      } else {
        toast.dark("Please Install Metamask !");
      }
      initializeWeb3();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <button className="styled-button" onClick={connectWallet}>
        Connect
      </button>
    </div>
  );
};

export default Connect;
