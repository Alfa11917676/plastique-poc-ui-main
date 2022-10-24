import { useEffect, useState } from "react";

import { TextField } from "@mui/material";
import { ethers } from "ethers";

import { VAULT_ABI } from "../../utils/contracts";

const VaultDetails: React.FC<{ vaultAddress: string; asset: string }> = ({
  vaultAddress,
  asset,
}) => {
  const [currentPrice, setCurrentPrice] = useState("0");
  const [depositAmount, setDepositAmount] = useState("0");
  const [redeemAmount, setRedeemAmount] = useState("0");
  const [totalAssets, setTotalAssets] = useState("0");
  const [entryFees, setEntryFees] = useState("0");
  const [exitFees, setExitFees] = useState("0");
  const [protocolEntryFees, setProtocolEntryFees] = useState("0");
  const [protocolExitFees, setProtocolExitFee] = useState("0");
  const [totalRewardAccumulated, setTotalRewardAccumulated] = useState("0");
  const [totalSupply, setTotalSupply] = useState("-");
  useEffect(() => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);
    const getCurrentPrice = async () => {
      try {
        const res = await vault.currentPrice();
        console.log({ getCurrentPrice: ethers.BigNumber.from(res).toString() });

        setCurrentPrice(ethers.BigNumber.from(res).toString());
      } catch (error) {
        console.error(error);
      }
    };

    const getTotalSupply = async () => {
      const res = await vault.totalSupply();
      setTotalSupply(ethers.utils.formatEther(res));
    };

    const getTotalAssets = async () => {
      try {
        const res = await vault.totalAssets();
        setTotalAssets(res);
      } catch (error) {
        console.error(error);
      }
    };

    const getEntryFees = async () => {
      const res = await vault.entryFeeParameter();
      setEntryFees(res);
    };

    const getExitFees = async () => {
      const res = await vault.exitFeeParameter();
      setExitFees(res);
    };

    const getProtocolEntryFee = async () => {
      const res = await vault.protocolEntryFee();
      setProtocolEntryFees(res);
    };

    const getProtocolExitFee = async () => {
      const res = await vault.protocolExitFee();
      setProtocolExitFee(res);
    };

    const getTotalRewardAccumulated = async () => {
      const res = await vault.totalRewardAccumulated();
      setTotalRewardAccumulated(res);
    };
    getTotalSupply();
    getEntryFees();
    getExitFees();
    getProtocolEntryFee();
    getProtocolExitFee();
    getTotalRewardAccumulated();
    getTotalAssets();
    getCurrentPrice();
  }, [vaultAddress]);

  const onDeposit = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const addresses = await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const Vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);
    const VaultSigner = Vault.connect(signer);

    console.log(addresses[0]);

    await VaultSigner.depositVaultAsset(ethers.utils.parseEther(String(depositAmount)));
  };

  const onRedeem = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const Vault = new ethers.Contract(vaultAddress, VAULT_ABI, provider);
    const VaultSigner = Vault.connect(signer);

    await VaultSigner.redeem(ethers.utils.parseEther(String(redeemAmount)));
  };
  if (!vaultAddress) return <div></div>;

  return (
    <div className="p-4 border border-gray-800 rounded-xl my-4">
      <a
        href={`https://rinkeby.etherscan.io/address/${vaultAddress}`}
        target={"_blank"}
        rel="noreferrer"
      >
        <h4>Vault {vaultAddress}</h4>
      </a>

      <div className="border-t border-gray-200">
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Asset Address</dt>

            <a
              href={`https://rinkeby.etherscan.io/address/${asset}`}
              target={"_blank"}
              rel="noreferrer"
            >
              <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">{asset}</dd>
            </a>
          </div>
        </dl>

        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Current Price</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">{currentPrice}</dd>
          </div>
        </dl>

        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Asset Balance</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {ethers.utils.formatEther(totalAssets)}
            </dd>
          </div>
        </dl>

        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Supply</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">{totalSupply}</dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Entry Fees %</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {ethers.utils.formatEther(entryFees)}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Exit Fees %</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {ethers.utils.formatEther(exitFees)}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Protocol Entry Fees %</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {ethers.utils.formatEther(protocolEntryFees)}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Protocol Exit Fees %</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {ethers.utils.formatEther(protocolExitFees)}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Total Reward Accumulated</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {ethers.utils.formatEther(totalRewardAccumulated)}
            </dd>
          </div>
        </dl>
        <div className="grid grid-cols-4 gap-8 items-center justify-center">
          <TextField
            label="amount"
            variant="outlined"
            value={depositAmount}
            type="number"
            onChange={(e) => setDepositAmount(e.currentTarget.value)}
          />
          <button
            type="button"
            className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={onDeposit}
          >
            Deposit
          </button>
        </div>
        <div className="grid grid-cols-4 gap-8 items-center justify-center mt-4">
          <TextField
            label="amount"
            variant="outlined"
            value={redeemAmount}
            type="number"
            onChange={(e) => setRedeemAmount(e.currentTarget.value)}
          />
          <button
            type="button"
            className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={onRedeem}
          >
            Redeem
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultDetails;
