import { atom } from "recoil";

export const filterAtom = atom<any>({
  key: "example",
  default: { type: 1, status: 1 },
});

export const walletAtom = atom<string>({
  key: "wallet",
  default: "",
});
