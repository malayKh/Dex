import { Button } from "@web3uikit/core";
import { useState, useEffect } from "react";
import { useWeb3Contract, useMoralis } from "react-moralis";
import dexAbi from "../../dex_backend/artifacts/contracts/DEX.sol/DEX.json";

const abi = dexAbi.abi;

export interface DepositBoxProps {
  contractAddress: string;
  msgValue: string;
}

export default function DepositBox({
  contractAddress,
  msgValue,
}: DepositBoxProps) {
  const { isWeb3Enabled } = useMoralis();

  const { runContractFunction: depositToken } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "deposit",
    msgValue: msgValue,
  });
  return (
    <div>
      {isWeb3Enabled ? (
        <>
          <h2>Deposit Liquidity </h2>
          <Button
            text="Deposit"
            onClick={() =>
              depositToken({
                onComplete() {
                  console.log("yo");
                },
                onError(error) {
                  console.log(error);
                },
              })
            }
          ></Button>
        </>
      ) : (
        <div>Loading... </div>
      )}
    </div>
  );
}
