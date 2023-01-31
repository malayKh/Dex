import dexAbi from "../../dex_backend/artifacts/contracts/DEX.sol/DEX.json";
const abi = dexAbi.abi;
import { useWeb3Contract } from "react-moralis";
import { useState } from "react";
import { Input } from "@web3uikit/core";
import { Button } from "@web3uikit/core";

export interface OrderBox {
  contractAddress: string;
}

export default function OrderBox({ contractAddress }: OrderBox) {
  const [tokenInput, setTokenInput] = useState("");
  const [msgValue, setMsgValue] = useState("");
  const { runContractFunction: tokenInEth } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "tokenToEth",
    params: {
      tokenInput: tokenInput,
    },
  });
  const { runContractFunction: ethInToken } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "ethToToken",
    msgValue: msgValue,
  });

  return (
    <div>
      <Input
        label="Eth in tokens"
        name="Eth Convertor"
        onChange={(e) => setMsgValue(e.target.value)}
        type="number"
      ></Input>
      <Button
        text="Transact"
        onClick={() => {
          ethInToken();
        }}
      />

      <Input
        label="Tokens in eth"
        name="Token Convertor"
        onChange={(e) => setTokenInput(e.target.value)}
        type="number"
      ></Input>
      <Button
        text="Transact"
        onClick={() => {
          tokenInEth();
        }}
      />
    </div>
  );
}
