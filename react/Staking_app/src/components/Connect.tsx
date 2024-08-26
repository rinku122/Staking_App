import { useWeb3 } from "../context/Web3Context";
import { toast } from "react-toastify";

const Connect = () => {
  const { setWalletAddress, initializeWeb3 } = useWeb3();

  const connectWallet = async () => {
    try {
      toast.dismiss();
      const { ethereum }: any = window;
      if (typeof ethereum !== "undefined") {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        let _walletAddress = accounts[0];
        setWalletAddress(_walletAddress);
        localStorage.setItem("walletAddress", _walletAddress);
      } else {
        toast.dark("Please Install Metamask to access the App !");
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
