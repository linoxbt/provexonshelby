import { ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { toast } from "sonner";

/**
 * Wallet provider — wallet-adapter v8 auto-discovers AIP-62 wallets installed
 * in the browser (Petra, Martian, Pontem, OKX, Nightly, etc.). The same
 * Aptos-keyed wallet signs Provex attestations on Aptos AND Shelby blob
 * commitments (Shelby uses Ed25519 keys compatible with Aptos accounts).
 */
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <AptosWalletAdapterProvider
      autoConnect
      hideWallets={["Continue with Apple", "Continue with Google"]}
      dappConfig={{ network: Network.DEVNET, aptosConnectDappId: "provex" }}
      onError={(err) => {
        console.error("Wallet error", err);
        const msg = err?.message ?? String(err);
        if (!msg.toLowerCase().includes("user rejected")) toast.error(msg);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
