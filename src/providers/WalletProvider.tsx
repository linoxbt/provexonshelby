import { ReactNode, useMemo } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { Network } from "@aptos-labs/ts-sdk";
import { toast } from "sonner";

/**
 * Wallet provider wiring Petra, Martian, and Pontem.
 * The same Aptos-keyed wallet signs both Provex attestations on Aptos
 * AND Shelby blob commitments (Shelby uses Ed25519 keys compatible with Aptos accounts).
 */
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const wallets = useMemo(
    () => [new PetraWallet(), new MartianWallet(), new PontemWallet()],
    []
  );

  return (
    <AptosWalletAdapterProvider
      plugins={wallets}
      autoConnect
      dappConfig={{ network: Network.DEVNET, aptosConnectDappId: "provex" }}
      onError={(err) => {
        console.error("Wallet error", err);
        toast.error(err?.message ?? "Wallet error");
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
};
