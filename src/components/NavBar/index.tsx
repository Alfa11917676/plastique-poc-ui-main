/* eslint-disable no-underscore-dangle */
import React, { useEffect } from "react";

import jazzicon from "@metamask/jazzicon";
import { ethers } from "ethers";
import Link from "next/link";
import { useRecoilState } from "recoil";

import { walletAtom } from "../../services/recoil/atoms";

const LandingNavBar: React.FC<unknown> = () => {
  const [walletAddress, setWalletAddress] = useRecoilState(walletAtom);

  useEffect(() => {
    const displayAddress = async () => {
      if (!window.ethereum) return;
      const isUnlocked = await window?.ethereum?._metamask.isUnlocked();
      console.debug({ isUnlocked });

      if (!isUnlocked) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const address = (await provider.listAccounts())[0];
      setWalletAddress(address || "");
      if (address) {
        const addr = address.slice(2, 10);
        const seed = parseInt(addr, 16);
        const icon = jazzicon(30, seed);
        document.getElementById("wallet-icon")?.replaceWith(icon);
      }

      window.ethereum
        ?.request({
          method: `wallet_switchEthereumChain`,
          params: [{ chainId: `0x5` }],
        })
        .catch(console.error);

      window.ethereum?.on(`accountsChanged`, (accounts: string[]) => {
        if (accounts.length) {
          window.location.reload();
        }
      });
      window.ethereum?.on(`chainChanged`, () => {
        window.location.reload();
      });
    };

    displayAddress();
  }, [walletAddress]);

  const connectMetamask = async () => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send(`eth_requestAccounts`, []);
      const address = (await provider.listAccounts())[0];
      setWalletAddress(address || "");
    }
  };

  const RIGHT_NAVBAR = (
    <div className="flex items-center space-x-4">
      <div
        className="flex items-center justify-center rounded-full p-1 hover:cursor-pointer  border-mainBlue"
        style={{
          background: ' url("/assets/svg/account-circle.svg")',
          backgroundSize: "contain",
        }}
      >
        {walletAddress ? (
          // `${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}`
          <Link href="#">
            <div className="flex flex-col justify-center items-center space-y-1">
              <a style={{ height: 30 }} href="">
                <div className="" id="wallet-icon" />
              </a>
              <span>{`${walletAddress.slice(0, 5)}...${walletAddress.slice(-4)}`}</span>
            </div>
          </Link>
        ) : (
          <img
            onClick={connectMetamask}
            src="/assets/svg/metamask-logo.svg"
            className=" h-6 w-6"
            alt=""
          />
        )}
      </div>
    </div>
  );
  return (
    <div className=" p-1">
      <div className="flex flex-col lg:flex-row items-center justify-between p-2 px-4">
        <h3>Plastique DAO Sandbox</h3>
        {RIGHT_NAVBAR}
      </div>
      <div
        className="absolute left-0 h-1 w-full border-t border-gray-700"
        style={{ borderTop: `1px solid rgba(255, 255, 255, 0.2)` }}
      />
    </div>
  );
};

export default LandingNavBar;
