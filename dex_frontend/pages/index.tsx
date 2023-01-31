import { useMoralis } from "react-moralis";
import DepositBox from "../components/DepositBox";
import WithdrawBox from "../components/WithdrawBox";
import OrderBox from "../components/OrderBox";

export default function Home() {
  const { isWeb3Enabled, chainId } = useMoralis();
  const chainString = chainId ? parseInt(chainId).toString() : "1337";
  return (
    <div>
      <OrderBox contractAddress="0xe7f1725e7734ce288f8367e1bb143e90bb3f0512" />
      <DepositBox
        contractAddress="0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"
        msgValue="100000000000000000"
      />
      <WithdrawBox
        contractAddress="0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"
        amount="100000000000000000"
      />
    </div>
  );
}
