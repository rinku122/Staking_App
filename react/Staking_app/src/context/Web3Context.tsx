import React, { createContext, useContext, useEffect, useState } from "react";
import Web3 from "web3";

type Web3ContextType = {
  web3: Web3 | null;
  initializeWeb3: () => void;
};

const Web3Context = createContext<Web3ContextType>({
  web3: null,
  initializeWeb3: () => {},
});

export const useWeb3 = () => useContext(Web3Context);

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);

  const initializeWeb3 = async () => {
    const { ethereum }: any = window;

    const _web3 = new Web3('http://127.0.0.1:8545');

    setWeb3(_web3);
  };

  // Effect to initialize Web3 when the component mounts
  useEffect(() => {
    initializeWeb3();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        web3,
        initializeWeb3,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
