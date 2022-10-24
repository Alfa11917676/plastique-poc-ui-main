import { useEffect, useState } from "react";

import { TextField } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ethers } from "ethers";

import VaultDetails from "../components/vaultDetails";
import { Meta } from "../layout/Meta";
import { Main } from "../templates/Main";
import { VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI } from "../utils/contracts";

export default function Index() {
  const [isConnected, setIsConnected] = useState(false);
  const [asset, setAsset] = useState("");
  const [protocolEntryFees, setProtocolEntryFees] = useState("");
  const [protocolExitFee, setProtocolExitFee] = useState("");
  const [exitFeePercentage, setExitFeePercentage] = useState("");
  const [entryFeePercentage, setEntryFeePercentage] = useState("");
  const [minimumDepositAmount, setMinimumDepositAmount] = useState("");
  const [vaults, setVaults] = useState<any>([]);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) {
        setIsConnected(true);
        return;
      }
      setIsConnected(true);
    })();
  }, []);

  useEffect(() => {
    if (!isConnected) return;
    (async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const vaultFactory = new ethers.Contract(VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, provider);
      const vaultsRes = await vaultFactory.queryFilter("VaultCreated");
      setVaults(
        vaultsRes.map((e) => {
          return {
            vaultAddress: e.args!.vaultAddress,
            // eslint-disable-next-line no-underscore-dangle
            asset: e.args!._collateralToken,
          };
        })
      );
    })();
  }, [isConnected]);

  const onCreate = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const vaultFactory = new ethers.Contract(VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, provider);
    const vaultFactorySigner = vaultFactory.connect(signer);
    const params = {
      collateralAsset: asset,
      calculationHelperAddress: "0xe38140e7E14C11B13218d5ad7AAf77F4B34664b7",
      protocolEntryFees: ethers.utils.parseEther(protocolEntryFees),
      protocolExitFee: ethers.utils.parseEther(protocolExitFee),
      entryFeePercentage: ethers.utils.parseEther(entryFeePercentage),
      exitFeePercentage: ethers.utils.parseEther(exitFeePercentage),
    };
    console.log(params);
    vaultFactorySigner.createVaults(
      params.collateralAsset,
      params.calculationHelperAddress,
      params.entryFeePercentage,
      params.exitFeePercentage,
      params.protocolEntryFees,
      params.protocolExitFee
    );
  };

  if (!isConnected)
    return (
      <h2 className=" text-center font-bold text-red-200 mt-20 mx-auto">
        Please connect to metamask and switch to Goerli Network
      </h2>
    );
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Main
        meta={<Meta title="Plastique DAO | Sandbox" description="The Sandbox of Plastique DAO" />}
      >
        <div className=" p-10">
          <h2 className="">Create Vault</h2>
          <div className="grid grid-cols-3 gap-4">
            <TextField
              label="Asset"
              variant="outlined"
              value={asset}
              onChange={(e) => setAsset(e.currentTarget.value)}
            />
            <TextField
              label="Entry Fee Percentage"
              variant="outlined"
              value={entryFeePercentage}
              onChange={(e) => setEntryFeePercentage(e.currentTarget.value)}
            />
            <TextField
              label="Exit Fee Percentage"
              variant="outlined"
              onChange={(e) => setExitFeePercentage(e.currentTarget.value)}
              value={exitFeePercentage}
              type="number"
            />
            <TextField
              label="Protocol Entry Fees"
              variant="outlined"
              onChange={(e) => setProtocolEntryFees(e.currentTarget.value)}
              value={protocolEntryFees}
            />
            <TextField
              label="Protocol Exit Fee Percentage"
              variant="outlined"
              onChange={(e) => setProtocolExitFee(e.currentTarget.value)}
              value={protocolExitFee}
            />

            <TextField
              label="Minimum Deposit Amount"
              variant="outlined"
              onChange={(e) => setMinimumDepositAmount(e.currentTarget.value)}
              value={minimumDepositAmount}
            />
          </div>
          <button
            type="button"
            className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={onCreate}
          >
            Create
          </button>
        </div>

        <div className="p-10">
          <h2>Vaults</h2>
          <div className="grid gap-4">
            {vaults.map((v: any) => (
              <VaultDetails key={v.vaultAddress} asset={v.asset} vaultAddress={v.vaultAddress} />
            ))}
          </div>
        </div>
      </Main>
    </LocalizationProvider>
  );
}
