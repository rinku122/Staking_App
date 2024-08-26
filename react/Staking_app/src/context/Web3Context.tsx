import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Web3 from "web3";
import { NETWORK_CHAIN_ID } from "../Constants";


// Define the type for the Web3 context.
//This will return the web3 instance .
type Web3ContextType = {
  web3: Web3 | null;
  initializeWeb3: () => void;
  setWalletAddress: React.Dispatch<React.SetStateAction<string | null>>;
  walletAddress: string | null;
};

const Web3Context = createContext<Web3ContextType>({
  web3: null,
  initializeWeb3: () => {},
  setWalletAddress: () => {},
  walletAddress: "",
});

export const useWeb3 = () => useContext(Web3Context);

const { ethereum }: any = window;
export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  //Checks for wallet and nwtwork. Checks if holesky is there or not. If not , it adds it to metamask

  const initializeWeb3 = async () => {
    const _web3 = new Web3(ethereum);

    

    if (typeof ethereum !== "undefined") {
      const currentChainId = (await _web3.eth.getChainId()).toString();

      if (currentChainId !== NETWORK_CHAIN_ID.toString()) {
        toast.dark("Switch to Holesky Network");
        const chainId = NETWORK_CHAIN_ID.toString(16);
        try {
          await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: `0x${chainId}` }],
          });
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${chainId}`,
                    chainName: "Holesky Testnet",
                    nativeCurrency: {
                      name: "ETH",
                      symbol: "ETH",
                      decimals: 18,
                    },
                    rpcUrls: ["https://ethereum-holesky-rpc.publicnode.com"],
                    blockExplorerUrls: [
                      "https://ethereum-holesky-rpc.publicnode.com",
                    ],
                  },
                ],
              });
            } catch (addError: any) {
              console.log(addError);
            }
          }
        }
      }
    } else {
      return toast.error("Please Install Metamask");
    }

    setWeb3(_web3);
  };

  // Effect to initialize Web3 when the component mounts
  useEffect(() => {
    initializeWeb3();

    //Listners for Network change in Metamsk
    ethereum?.on("chainChanged", () => {
      window.location.reload();
    });
    //Listners for Network change in Account Change

    ethereum?.on("accountsChanged", (accounts: string[]) => {
      let _walletAddress = accounts[0];
      if (_walletAddress) {
        setWalletAddress(_walletAddress);
        localStorage.setItem("walletAddress", _walletAddress);
      }
    });

    return () => {
      ethereum?.removeListener("chainChanged", () => console.log("Cleared"));
      ethereum?.removeListener("accountsChanged", () => console.log("Cleared"));
    };
  }, []);

  return (
    <Web3Context.Provider
      value={{
        web3,
        initializeWeb3,
        setWalletAddress,
        walletAddress,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
