import { useEffect, useState } from "react";

import { TextField, Select, MenuItem, InputLabel } from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ethers } from "ethers";
import { useRecoilState } from "recoil";

import KMarketDetailsCard from "../components/KMarketDetailsCard";
import { Meta } from "../layout/Meta";
import { walletAtom } from "../services/recoil/atoms";
import { Main } from "../templates/Main";
import {
  ERC20_ABI,
  K_MARKET_CONTROLLER_ABI,
  K_MARKET_CONTROLLER_ADDRESS,
  ZERO_ADDRESS,
} from "../utils/contracts";

export default function KMarket() {
  const [walletAddress] = useRecoilState(walletAtom);
  const [isConnected, setIsConnected] = useState(false);
  const [underlying, setUnderlying] = useState("0xe719b808b78870e88f76196170eb746df3cdba1e");
  const [collateral, setCollateral] = useState("0xe719b808b78870e88f76196170eb746df3cdba1e");
  const [strike, setStrike] = useState("");
  const [strategy, setStrategy] = useState("0x3FfA09a7896224a48A86f9d05805D4343Da8202e");
  const [oracle, setOracle] = useState("0xb53fbECd76cd039Ae4Ddb9cd8a3fB7e26D130837");
  const [dispute, setDispute] = useState(ZERO_ADDRESS);
  const [kyc, setKyc] = useState(ZERO_ADDRESS);
  const [expiry, setExpiry] = useState("");

  const [kMarketInstances, setKMarketInstances] = useState<any[]>([]);

  const [depositKMarketID, setDepositKMarketID] = useState<string>();
  const [depositAmount, setDepositAmount] = useState(0);

  const [redeemKTokenSetKMarketID, setRedeemKTokenSetMarketID] = useState<string>();
  const [redeemKTokenSetAmount, setRedeemKTokenSetAmount] = useState(0);

  const [redeemKMarketID, setRedeemMarketID] = useState<string>();
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [redeemIndex, setRedeemIndex] = useState(0);

  const [closeKMarketID, setCloseKMarketID] = useState<string>();

  console.log({ kMarketInstances, expiry: new Date(expiry).getTime() / 1000 });

  const onCreate = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const kMarketController = new ethers.Contract(
      K_MARKET_CONTROLLER_ADDRESS,
      K_MARKET_CONTROLLER_ABI,
      provider
    );

    const kMarketControllerSigner = kMarketController.connect(signer);
    console.log({
      underlyingAsset: underlying,
      strikeAsset: underlying,
      collateralAsset: underlying,
      strikePriceSet: [ethers.utils.parseEther(strike)],
      strategyEngine: strategy,
      oracleController: oracle,
      disputeEngine: dispute || ZERO_ADDRESS,
      kycEngine: kyc || ZERO_ADDRESS,
      eventController: ZERO_ADDRESS,
      expiryTimestamp: Math.floor(new Date(expiry).getTime() / 1000),
    });
    await kMarketControllerSigner.createKMarket({
      underlyingAsset: underlying,
      strikeAsset: underlying,
      collateralAsset: underlying,
      strikePriceSet: [ethers.utils.parseEther(strike)],
      strategyEngine: strategy,
      oracleController: oracle,
      disputeEngine: dispute || ZERO_ADDRESS,
      kycEngine: kyc || ZERO_ADDRESS,
      eventController: ZERO_ADDRESS,
      expiryTimestamp: Math.floor(new Date(expiry).getTime() / 1000),
    });
  };

  const onDeposit = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const kMarketController = new ethers.Contract(
      K_MARKET_CONTROLLER_ADDRESS,
      K_MARKET_CONTROLLER_ABI,
      provider
    );

    const kMarket = await kMarketController.kMarketInstances(depositKMarketID);

    console.log(kMarket);

    const collateralContract = new ethers.Contract(kMarket.collateralAsset, ERC20_ABI, provider);
    const kPoolAddress = await kMarketController.kPool();
    const allowance = await collateralContract.allowance(walletAddress, kPoolAddress);
    console.log({ allowance });

    const parsedDepositAmount = ethers.utils.parseEther(String(depositAmount));
    if (parsedDepositAmount.gt(allowance)) {
      const tx = await collateralContract
        .connect(signer)
        .increaseAllowance(kPoolAddress, ethers.utils.parseEther("10000000"));
      await tx.wait();
    }

    const kMarketControllerSigner = kMarketController.connect(signer);

    try {
      await kMarketControllerSigner["deposit(bytes32,uint256)"](
        depositKMarketID,
        parsedDepositAmount
      );
    } catch (error: any) {
      const revertHash: string | undefined = error?.error?.data?.originalError?.data || "";
      if (revertHash?.indexOf("0x5b232ecf") === 0) {
        alert(` account ${walletAddress} is not on KYC list`);
        return;
      }

      alert(error);
    }
  };

  const onRedeemKTokenSet = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const kMarketController = new ethers.Contract(
      K_MARKET_CONTROLLER_ADDRESS,
      K_MARKET_CONTROLLER_ABI,
      provider
    );
    const kMarketControllerSigner = kMarketController.connect(signer);

    await kMarketControllerSigner["kTokenSetRedeem(bytes32,uint256)"](
      redeemKTokenSetKMarketID,
      ethers.utils.parseEther(String(redeemKTokenSetAmount))
    );
  };

  const onRedeem = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const kMarketController = new ethers.Contract(
      K_MARKET_CONTROLLER_ADDRESS,
      K_MARKET_CONTROLLER_ABI,
      provider
    );
    const kMarketControllerSigner = kMarketController.connect(signer);

    await kMarketControllerSigner["redeem(bytes32,uint256,uint256)"](
      redeemKMarketID,
      redeemIndex,
      ethers.utils.parseEther(String(redeemAmount))
    );
  };

  const onCloseKMarket = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    const kMarketController = new ethers.Contract(
      K_MARKET_CONTROLLER_ADDRESS,
      K_MARKET_CONTROLLER_ABI,
      provider
    );
    const kMarketControllerSigner = kMarketController.connect(signer);

    await kMarketControllerSigner.closeKMarketInstance(closeKMarketID);
  };

  useEffect(() => {
    (async () => {
      if (!window.ethereum) {
        setIsConnected(false);
      }
      window.ethereum
        ?.request({
          method: `wallet_switchEthereumChain`,
          params: [{ chainId: `0x5` }],
        })
        .catch(console.error);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const address = (await provider.listAccounts())[0];
      if (!address) {
        setIsConnected(false);
      } else {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });
        if (chainId === "0x5") setIsConnected(true);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) return;
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const kMarketController = new ethers.Contract(
        K_MARKET_CONTROLLER_ADDRESS,
        K_MARKET_CONTROLLER_ABI,
        provider
      );
      // @ts-ignore
      const filter = kMarketController.filters.kMarketCreated();

      const events = await kMarketController.queryFilter(filter);
      const items: any[] = [];
      events.forEach((e) => {
        console.log(e?.args);

        items.push({ id: e?.args?.kMarketId, tx: e.transactionHash });
      });
      setKMarketInstances(items);
    })();
  }, []);

  if (!isConnected)
    return (
      <Main
        meta={<Meta title="Plastique DAO | Sandbox" description="The Sandbox of Plastique DAO" />}
      >
        <h2 className=" text-center font-bold text-red-200 mt-20 mx-auto">
          Please connect to metamask and switch to{" "}
          <a href="https://chainlist.org/"> Goerli Network </a>
        </h2>
      </Main>
    );
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Main
        meta={<Meta title="Plastique DAO | Sandbox" description="The Sandbox of Plastique DAO" />}
      >
        <div className="p-10 grid grid-cols-3 gap-4">
          <div className=" border border-gray-700 rounded-md p-4 text-xs">
            <h2 className="mb-4 border-b border-gray-800 pb-2">Available Oracles</h2>
            <div className="flex flex-col space-y-4 items-center">
              <div>
                (Chainlink){" "}
                <a
                  target={"_blank"}
                  href="https://goerli.etherscan.io/address/0xb53fbECd76cd039Ae4Ddb9cd8a3fB7e26D130837 "
                  rel="noreferrer"
                >
                  0xb53fbECd76cd039Ae4Ddb9cd8a3fB7e26D130837
                </a>
              </div>
              <div>
                (Manual){" "}
                <a
                  target={"_blank"}
                  href="https://goerli.etherscan.io/address/0xa8ccfc38d4dd07eede01ae5b9becff1e82f4cfc2 "
                  rel="noreferrer"
                >
                  0xa8ccfc38d4dd07eede01ae5b9becff1e82f4cfc2
                </a>
              </div>
            </div>
          </div>
          <div className=" border border-gray-700 rounded-md p-4 text-xs">
            <h2 className="mb-4 border-b border-gray-800 pb-2">Available Dispute Engines</h2>
            (Manual){" "}
            <a
              target={"_blank"}
              href="https://goerli.etherscan.io/address/0x4b0840c495683836b7838f6ec09ca47a37028c01"
              rel="noreferrer"
            >
              0x4B0840C495683836B7838f6ec09ca47a37028C01
            </a>
          </div>
          <div className=" border border-gray-700 rounded-md p-4 text-xs">
            <h2 className="mb-4 border-b border-gray-800 pb-2">Available Assets</h2>
            (mWETH){" "}
            <a
              target={"_blank"}
              href="https://goerli.etherscan.io/address/0xe719b808b78870e88f76196170eb746df3cdba1e"
              rel="noreferrer"
            >
              0xe719b808b78870e88f76196170eb746df3cdba1e
            </a>
          </div>
          <div className=" border border-gray-700 rounded-md p-4  text-xs">
            <h2 className="mb-4 border-b border-gray-800 pb-2">Available Strategies</h2>
            (CALL){" "}
            <a
              target={"_blank"}
              href="https://goerli.etherscan.io/address/0x3FfA09a7896224a48A86f9d05805D4343Da8202e"
              rel="noreferrer"
            >
              0x3FfA09a7896224a48A86f9d05805D4343Da8202e
            </a>
          </div>
          <div className=" border border-gray-700 rounded-md p-4 text-xs">
            <h2 className="mb-4 border-b border-gray-800 pb-2">Available KYC Engines</h2>
            (on-chain){" "}
            <a
              target={"_blank"}
              href="https://goerli.etherscan.io/address/0x557DadE224cD4Cb1cf74706Eebe7D3cFf0A7CA21"
              rel="noreferrer"
            >
              0x557DadE224cD4Cb1cf74706Eebe7D3cFf0A7CA21
            </a>
          </div>
        </div>
        <div className=" p-10">
          <h2 className="">Create kMarket Instance</h2>
          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="grid ">
              <InputLabel id="Underlying">Underlying Asset</InputLabel>
              <Select
                style={{ color: "white" }}
                value={underlying}
                id="Underlying"
                onChange={(e) => setUnderlying(e.target.value as any)}
              >
                <MenuItem value={"0xe719b808b78870e88f76196170eb746df3cdba1e"}>mWETH</MenuItem>
              </Select>
            </div>

            <div className="grid ">
              <InputLabel id="Collateral">Collateral Asset</InputLabel>
              <Select
                style={{ color: "white" }}
                value={collateral}
                id="Collateral"
                onChange={(e) => setCollateral(e.target.value as any)}
              >
                <MenuItem value={"0xe719b808b78870e88f76196170eb746df3cdba1e"}>mWETH</MenuItem>
              </Select>
            </div>
            <TextField
              label="Strike Price"
              variant="outlined"
              onChange={(e) => setStrike(e.currentTarget.value)}
              value={strike}
              type="number"
            />
            <div className="grid">
              <InputLabel id="Strategy">Strategy Engine</InputLabel>
              <Select
                value={strategy}
                id="Strategy"
                onChange={(e) => setStrategy(e.target.value as any)}
              >
                <MenuItem value={"0x3FfA09a7896224a48A86f9d05805D4343Da8202e"}>Call</MenuItem>
              </Select>
            </div>

            <div className="grid ">
              <InputLabel id="oracle">Oracle</InputLabel>
              <Select
                style={{ color: "white" }}
                value={oracle}
                id="oracle"
                onChange={(e) => setOracle(e.target.value as any)}
              >
                <MenuItem value={"0xb53fbECd76cd039Ae4Ddb9cd8a3fB7e26D130837"}>
                  Chain Link Oracle
                </MenuItem>
                <MenuItem value={"0xa8ccfc38d4dd07eede01ae5b9becff1e82f4cfc2"}>
                  Manual Oracle Controller
                </MenuItem>
              </Select>
            </div>

            <div className="grid">
              <InputLabel id="dispute">Dispute Engine</InputLabel>
              <Select
                value={dispute}
                id="dispute"
                onChange={(e) => setDispute(e.target.value as any)}
              >
                <MenuItem value={"0x4b0840c495683836b7838f6ec09ca47a37028c01"}>
                  Manual Dispute Engine
                </MenuItem>
                <MenuItem value={ZERO_ADDRESS}>NONE</MenuItem>
              </Select>
            </div>

            <div className="grid">
              <InputLabel id="Kyc">Kyc Engine</InputLabel>
              <Select value={kyc} id="Kyc" onChange={(e) => setKyc(e.target.value as any)}>
                <MenuItem value={"0x557DadE224cD4Cb1cf74706Eebe7D3cFf0A7CA21"}>
                  Plastique On-chain
                </MenuItem>
                <MenuItem value={ZERO_ADDRESS}>NONE</MenuItem>
              </Select>
            </div>
            <TextField
              disabled
              id="outlined-basic"
              label="Exotic Events Controller"
              variant="outlined"
            />
            <DateTimePicker
              renderInput={(props) => <TextField {...props} />}
              label="Expiry Timestamp"
              value={expiry || Date.now()}
              onChange={(newValue) => {
                setExpiry((newValue as any) || "");
              }}
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
          <h2>kMarket Instances</h2>

          {kMarketInstances.map((item) => {
            return <KMarketDetailsCard kMarketID={item.id} key={item.id} />;
          })}
        </div>

        <div className="p-10">
          <h2>Deposit</h2>
          <div className="grid grid-cols-3 gap-4">
            <TextField
              label="kMarketID"
              variant="outlined"
              value={depositKMarketID}
              onChange={(e) => setDepositKMarketID(e.currentTarget.value)}
            />
            <TextField
              label="amount"
              variant="outlined"
              value={depositAmount}
              type="number"
              onChange={(e) => setDepositAmount(Number(e.currentTarget.value))}
            />
          </div>
          <button
            type="button"
            className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={onDeposit}
          >
            Deposit
          </button>
        </div>

        <div className="p-10">
          <h2> Redeem kTokenSet</h2>
          <div className="grid grid-cols-3 gap-4">
            <TextField
              label="kMarketID"
              variant="outlined"
              value={redeemKTokenSetKMarketID}
              onChange={(e) => setRedeemKTokenSetMarketID(e.currentTarget.value)}
            />
            <TextField
              label="amount"
              variant="outlined"
              value={redeemKTokenSetAmount}
              type="number"
              onChange={(e) => setRedeemKTokenSetAmount(Number(e.currentTarget.value))}
            />
          </div>
          <button
            type="button"
            className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={onRedeemKTokenSet}
          >
            Redeem
          </button>
        </div>

        <div className="p-10">
          <h2>Redeem</h2>
          <div className="grid grid-cols-3 gap-4">
            <TextField
              label="kMarketID"
              variant="outlined"
              value={redeemKMarketID}
              onChange={(e) => setRedeemMarketID(e.currentTarget.value)}
            />
            <TextField
              label="amount"
              variant="outlined"
              value={redeemAmount}
              type="number"
              onChange={(e) => setRedeemAmount(Number(e.currentTarget.value))}
            />
            <Select
              value={redeemIndex}
              variant="filled"
              label="kToken"
              style={{ color: "white" }}
              onChange={(e) => setRedeemIndex(Number(e.target.value))}
            >
              <MenuItem value={0}>WriteKToken</MenuItem>
              <MenuItem value={1}>BuyKToken</MenuItem>
            </Select>
          </div>
          <button
            type="button"
            className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={onRedeem}
          >
            Redeem
          </button>
        </div>

        <div className="p-10">
          <h2>Close Market</h2>
          <div className="grid grid-cols-3">
            <TextField
              label="kMarketID"
              variant="outlined"
              value={closeKMarketID}
              onChange={(e) => setCloseKMarketID(e.currentTarget.value)}
            />
          </div>

          <button
            type="button"
            className="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
            onClick={onCloseKMarket}
          >
            Close
          </button>
        </div>
      </Main>
    </LocalizationProvider>
  );
}
