import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { DEX__factory } from "../typechain-types/factories/contracts/DEX__factory";
import { Balloons__factory } from "../typechain-types/factories/contracts/Balloons__factory";
import { ethers } from "hardhat";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const [signer] = await ethers.getSigners();
  const tokenFactory = (await ethers.getContractFactory(
    "Balloons",
    signer
  )) as Balloons__factory;
  const tokenContract = await tokenFactory.deploy();
  const dexFactory = (await ethers.getContractFactory(
    "DEX",
    signer
  )) as DEX__factory;
  const dexContract = await dexFactory.deploy(tokenContract.address);
  await tokenContract.approve(
    dexContract.address,
    ethers.utils.parseEther("10")
  );
  await dexContract.init(ethers.utils.parseEther("5"), {
    gasLimit: 5000000,
    value: ethers.utils.parseEther("5"),
  });
};
export default func;
func.tags = ["all"];
