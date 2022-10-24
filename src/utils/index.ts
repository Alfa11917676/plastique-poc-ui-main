import { ethers } from "ethers";

export enum Currencies {
  Ethereum = 1,
}
export const getCurrencyLogo = (currency: Currencies): string => {
  switch (currency) {
    case Currencies.Ethereum:
      return "/assets/svg/ethereum-logo.svg";
    default:
      return "";
  }
};

export const getProvider = () => {
  return new ethers.providers.InfuraProvider(`goerli`, `07447ee41c2f4f4faf367d4ee05f5bb8`);
};

export const getConnectedAddress = async (): Promise<string> => {
  if (window.ethereum) {
    // eslint-disable-next-line no-underscore-dangle
    const isUnlocked = await window.ethereum?._metamask.isUnlocked();
    if (!isUnlocked) return "";
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send(`eth_requestAccounts`, []);
    const address = (await provider.listAccounts())[0];
    return address || "";
  }
  return "";
};

export const shortenAddress = (address: string): string => {
  if (!address || typeof address !== "string" || address.length < 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};
