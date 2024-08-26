import "./App.css";
import Connect from "./components/Connect";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify";
import { useWeb3 } from "./context/Web3Context";
import { useEffect } from "react";

function App() {
  const { setWalletAddress, walletAddress, initializeWeb3 } = useWeb3();

  useEffect(() => {
    const address = localStorage.getItem("walletAddress");
    if (!address) return;
    setWalletAddress(address);
    initializeWeb3();
  }, []);

  const disconnect = () => {
    setWalletAddress(null);
    localStorage.removeItem("walletAddress");
  };

  return (
    <>
      <ToastContainer />
      {walletAddress ? (
        <div>
          <Dashboard />
          <button onClick={disconnect} className="footer">
            Disconnect
          </button>
        </div>
      ) : (
        <Connect />
      )}
    </>
  );
}

export default App;
