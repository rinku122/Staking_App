import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Web3Provider } from "./context/Web3Context.tsx";
import { ContractProvider } from "./context/ContractContext.tsx";

createRoot(document.getElementById("root")!).render(
    <Web3Provider>
      <ContractProvider>
        <App />
      </ContractProvider>
    </Web3Provider>
);
