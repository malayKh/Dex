import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MoralisProvider } from "react-moralis";
import Header from "../components/Header";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider serverUrl={"http://127.0.0.1:8545/"} appId={"01"}>
      <Header />
      <Component {...pageProps} />
    </MoralisProvider>
  );
}
