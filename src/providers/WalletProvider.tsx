import { ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { toast } from "sonner";
import { pushDiag } from "@/lib/walletDiagnostics";

/**
 * Wallet provider — wallet-adapter v8 auto-discovers AIP-62 wallets installed
 * in the browser (Petra, Martian, Pontem, OKX, Nightly, etc.). Provex requires
 * Aptos TESTNET so the Shelby blob attestation flow validates against the
 * shared testnet indexer.
 */
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect
      hideWallets={["Continue with Apple", "Continue with Google"]}
      dappConfig={{ network: Network.TESTNET, aptosConnectDappId: "provex" }}
      onError={(err: any) => {
        console.error("Wallet error", err);
        const msg = err?.message ?? String(err);
        pushDiag({ level: "error", source: "adapter", message: msg });
        if (!msg.toLowerCase().includes("user rejected")) toast.error(msg);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
