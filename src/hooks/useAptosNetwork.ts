import { useCallback, useMemo } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import { pushDiag } from "@/lib/walletDiagnostics";

export const REQUIRED_NETWORK = Network.TESTNET;

/** Returns network state for the connected wallet + a helper to switch. */
export const useAptosNetwork = () => {
  const { network, changeNetwork, connected, wallet } = useWallet();

  const currentName = (network?.name ?? "").toString().toLowerCase();
  const isCorrect = connected && currentName === REQUIRED_NETWORK.toLowerCase();

  const switchToTestnet = useCallback(async () => {
    if (!connected) return false;
    try {
      if (typeof changeNetwork === "function") {
        await changeNetwork(REQUIRED_NETWORK);
        pushDiag({ level: "info", source: "network", message: `Switched to ${REQUIRED_NETWORK}` });
        return true;
      }
      pushDiag({
        level: "warn",
        source: "network",
        message: `${wallet?.name ?? "Wallet"} does not support programmatic network switching. Open the wallet and choose Testnet.`,
      });
      return false;
    } catch (e: any) {
      pushDiag({ level: "error", source: "network", message: e?.message ?? String(e) });
      return false;
    }
  }, [changeNetwork, connected, wallet?.name]);

  return useMemo(
    () => ({
      current: network?.name ?? null,
      required: REQUIRED_NETWORK,
      isCorrect,
      switchToTestnet,
    }),
    [network?.name, isCorrect, switchToTestnet]
  );
};
