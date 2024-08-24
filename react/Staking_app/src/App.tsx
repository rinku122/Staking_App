import { useEffect, useState } from "react";
import "./App.css";
import Connect from "./components/Connect";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>("");

  useEffect(() => {
    setWalletAddress(localStorage.getItem("walletAddress"));
  }, []);

  return (
    <>
      <ToastContainer />
      {walletAddress ? (
        <div>
          <Dashboard walletAddress={walletAddress} />
        </div>
      ) : (
        <Connect
          setWalletAddress={setWalletAddress}
          walletAddress={walletAddress}
        />
      )}
    </>
  );
}

export default App;
