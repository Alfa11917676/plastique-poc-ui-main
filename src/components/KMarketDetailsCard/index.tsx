import { useEffect, useState } from "react";

import { ethers } from "ethers";

import {
  DISPUTE_ABI,
  K_MARKET_CONTROLLER_ABI,
  K_MARKET_CONTROLLER_ADDRESS,
  ORACLE_ABI,
  ZERO_ADDRESS,
} from "../../utils/contracts";

const KMarketDetailsCard: React.FC<{ kMarketID: string }> = ({ kMarketID }) => {
  const [withDispute, setWithDispute] = useState(false);
  const [kMarketDetails, setKMarketDetails] = useState<any>();
  const [kRatios, setKRatios] = useState<any>([]);
  const [kTokenSet, setKTokenSet] = useState([]);
  const [strikePriceSet, setStrikePriceSet] = useState([]);
  const [oraclePrice, setOraclePrice] = useState(0);
  const [disputePrice, setDisputePrice] = useState(0);
  useEffect(() => {
    if (!window.ethereum) return;
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const kMarketController = new ethers.Contract(
      K_MARKET_CONTROLLER_ADDRESS,
      K_MARKET_CONTROLLER_ABI,
      provider
    );
    (async () => {
      // @ts-ignore
      const kMarketInstancesResult = await kMarketController.kMarketInstances(kMarketID);
      setKMarketDetails(kMarketInstancesResult as any);
      console.log({ kMarketInstancesResult });

      const kRatiosResult = await kMarketController.getKRatio(kMarketID);
      setKRatios(kRatiosResult);
      console.log({ kRatiosResult });
    })();

    const getKTokenSet = async () => {
      const kTokenSetResult = await kMarketController.getKTokenSet(kMarketID);
      setKTokenSet(kTokenSetResult);
    };

    const getStrikePriceSet = async () => {
      const strikePriceSetResult = await kMarketController.getStrikePriceSet(kMarketID);
      setStrikePriceSet(strikePriceSetResult);
    };

    getKTokenSet();
    getStrikePriceSet();
  }, []);

  useEffect(() => {
    if (!window.ethereum || !kMarketDetails) return;

    const getOraclePrice = async () => {
      if (kMarketDetails.oracleController) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const oracle = new ethers.Contract(kMarketDetails.oracleController, ORACLE_ABI, provider);
        const oracleResult = await oracle.getSettlementPrice(
          kMarketDetails.underlyingAsset,
          kMarketDetails.expiryTimestamp
        );

        if (oracleResult.gt(0)) {
          setOraclePrice(ethers.utils.formatEther(oracleResult) as any);
        }
      }
    };

    const getDisputePrice = async () => {
      if (kMarketDetails.disputeEngine !== ZERO_ADDRESS) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const oracle = new ethers.Contract(kMarketDetails.disputeEngine, DISPUTE_ABI, provider);
        const disputeResult = await oracle.getSettlementPrice(
          kMarketDetails.underlyingAsset,
          kMarketDetails.expiryTimestamp
        );
        setWithDispute(true);
        setDisputePrice(disputeResult / 10 ** 8);
      }
    };

    getOraclePrice();
    getDisputePrice();
  }, [kMarketDetails]);

  if (!kMarketDetails) return <div></div>;

  return (
    <div className="p-4 border border-gray-800 rounded-xl my-4">
      <h4>kMarketID: {kMarketID}</h4>
      <div className="border-t border-gray-200">
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Collateral Asset</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kMarketDetails?.collateralAsset}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Underlying Asset</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kMarketDetails?.underlyingAsset}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">poolShareTokens</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {ethers.utils.formatEther(kMarketDetails?.poolShareTokens)}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Expires At</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {ethers.BigNumber.from(kMarketDetails.expiryTimestamp).toString()}{" "}
              <span className=" underline">
                {"("}
                {new Date(kMarketDetails.expiryTimestamp * 1000).toISOString()} {" UTC)"}
              </span>
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Strategy Engine</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kMarketDetails.strategyEngine}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Oracle Controller</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kMarketDetails.oracleController}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Dispute Engine</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kMarketDetails.disputeEngine}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">KYC Engine</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kMarketDetails.kycEngine}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Strike Price</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {strikePriceSet[0] ? ethers.utils.formatEther(strikePriceSet[0]) : ""}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Buy kToken</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kTokenSet[1] || ""}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Write kToken</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kTokenSet[0] || ""}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Buy kRatio</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kRatios.length === 0 ? "unavailable" : ethers.utils.formatEther(kRatios[1])}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Write kRatio</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {kRatios.length === 0 ? "unavailable" : ethers.utils.formatEther(kRatios[0])}
            </dd>
          </div>
        </dl>
        <dl>
          <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Oracle Settlement Price</dt>
            <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
              {oraclePrice || "unavailable"}
            </dd>
          </div>
        </dl>
        <dl>
          {withDispute && (
            <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dispute Window</dt>
              <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
                1 hour{" "}
                <span>
                  {kMarketDetails.expiryTimestamp &&
                    new Date(
                      (Number(kMarketDetails.expiryTimestamp) + 3600) * 1000
                    ).toISOString()}{" "}
                  {" UTC)"}
                </span>{" "}
              </dd>
            </div>
          )}
        </dl>
        {withDispute && (
          <dl>
            <div className=" px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Dispute Settlement Price</dt>
              <dd className="mt-1 text-sm text-gray-300 sm:col-span-2 sm:mt-0">
                {disputePrice || "unavailable"}
              </dd>
            </div>
          </dl>
        )}
      </div>
    </div>
  );
};

export default KMarketDetailsCard;
