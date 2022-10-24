import { useEffect, useState } from "react";

import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { ethers } from "ethers";
import Link from "next/link";

import { Meta } from "../layout/Meta";
import { Main } from "../templates/Main";

export default function Index() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    (async () => {
      if (!window.ethereum) {
        setIsConnected(false);
        return;
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const address = (await provider.listAccounts())[0];
      if (!address) {
        setIsConnected(false);
      } else {
        setIsConnected(true);
      }
    })();
  }, []);

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
        <div className="my-10" />
        <Link href="/k-market">
          <a href="">kMarket</a>
        </Link>
        <div className="my-10" />
        <Link href="/plastique-vault">
          <a href="">Plastique Vault</a>
        </Link>
      </Main>
    </LocalizationProvider>
  );
}
