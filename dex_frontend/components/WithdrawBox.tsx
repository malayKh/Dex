import { Button } from "@web3uikit/core";
import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import dexAbi from "../../dex_backend/artifacts/contracts/DEX.sol/DEX.json";
import { ethers, BigNumber } from "ethers";

const abi = dexAbi.abi;

export interface WithdrawBoxProps {
  contractAddress: string;
  amount: string;
}

export default function WithdrawBox({
  contractAddress,
  amount,
}: WithdrawBoxProps) {
  const { runContractFunction: withdrawToken } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "withdraw",
    params: {
      amount: amount,
    },
  });
  return (
    <div>
      <h2>Withdraw Liquidity</h2>
      <Button
        text="Withdraw"
        onClick={async () =>
          withdrawToken({
            onSuccess() {
              console.log("done");
            },
          })
        }
      ></Button>
    </div>
  );
}
