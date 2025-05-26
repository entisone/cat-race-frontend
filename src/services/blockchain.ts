import { ethers } from "ethers";
import CatRaceABI from "../abis/CatRace.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getContract = async () => {
  if (!(window as any).phantom?.ethereum)
    throw new Error("Phantom wallet not found");
  await (window as any).phantom.ethereum.request({
    method: "eth_requestAccounts",
  });
  const provider = new ethers.BrowserProvider((window as any).phantom.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, CatRaceABI.abi, signer);
};
