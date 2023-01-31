import { expect } from "chai";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {
  DEX,
  DEX__factory,
  Balloons,
  Balloons__factory,
} from "../typechain-types";
import { ethers } from "hardhat";
import { BigNumber, ContractReceipt, ContractTransaction } from "ethers";

describe("DEX contract", function () {
  let dexContract: DEX;
  let tokenContract: Balloons;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  let oneEther = ethers.utils.parseEther("1");

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    const tokenFactory = (await ethers.getContractFactory(
      "Balloons",
      owner
    )) as Balloons__factory;
    tokenContract = await tokenFactory.deploy();
    const dexFactory = (await ethers.getContractFactory(
      "DEX",
      owner
    )) as DEX__factory;
    dexContract = await dexFactory.deploy(tokenContract.address);
    const AMOUNT = ethers.utils.parseEther("5");
    await tokenContract.approve(dexContract.address, AMOUNT.mul(20));
    await dexContract.init(AMOUNT, { value: AMOUNT });
    // console.log(await deployments.fixture(["all"]));
    // dexContract = await ethers.getContract("DEX");
    // tokenContract = await ethers.getContract("Balloons");
  });

  describe("DEX: Standard Path", function () {
    // TODO: need to add tests that the other functions do not work if we try calling them without init() started.
    /* TODO checking `price` calcs. Preferably calculation test should be provided by somebody who didn't implement this functions in
    challenge to not reproduce mistakes systematically.*/
    describe("init()", function () {
      it("Shouldnt allow initialize if liquidty is not zero", async () => {
        await expect(
          dexContract.init(oneEther, { value: oneEther })
        ).to.be.revertedWith("DEX:init - already has liquidity");
      });

      describe("ethToToken()", function () {
        it("Should send 1 Ether to DEX in exchange for _ $BAL", async function () {
          let tx1 = await dexContract.ethToToken({
            value: ethers.utils.parseEther("1"),
          });
          // TODO: SYNTAX - Figure out how to read eth balance of dex contract and to compare it against the eth sent in via this tx. Also
          //figure out why/how to read the event that should be emitted with this too.
          /* Also, notice, that reference `DEX.sol` could emit *after* `return`, so that they're never emited. It's on your own to find and
          correct */

          expect(
            await ethers.provider.getBalance(dexContract.address)
          ).to.equal(BigNumber.from(ethers.utils.parseEther("6")));

          await expect(tx1).to.emit(dexContract, "EthToTokenSwap");
        });

        it("Should send less tokens after the first trade (ethToToken called)", async function () {
          const etherBalanceOfDex = await ethers.provider.getBalance(
            dexContract.address
          );
          const priceOfBalloon = await dexContract.price(
            ethers.utils.parseEther("1"),
            etherBalanceOfDex,
            await tokenContract.balanceOf(dexContract.address)
          );
          await dexContract.ethToToken({
            value: ethers.utils.parseEther("1"),
          });
          const priceOfBalloon2 = await dexContract.price(
            ethers.utils.parseEther("1"),
            etherBalanceOfDex,
            await tokenContract.balanceOf(dexContract.address)
          );
          let tx1 = await dexContract.connect(owner).ethToToken({
            value: ethers.utils.parseEther("1"),
          });
          const priceOfBalloon3 = await dexContract.price(
            ethers.utils.parseEther("1"),
            etherBalanceOfDex,
            await tokenContract.balanceOf(dexContract.address)
          );
          expect(priceOfBalloon.sub(priceOfBalloon2)).greaterThan(
            priceOfBalloon2.sub(priceOfBalloon3)
          );

          it("Should not allow to send zero ether", async () => {});
          await expect(dexContract.ethToToken({ value: 0 })).to.be.revertedWith(
            "No eth sent to swap!"
          );
        });
        describe("tokenToEth", async () => {
          it("Should send 1 $BAL to DEX in exchange for _ $ETH", async function () {
            const balloons_bal_start = await tokenContract.balanceOf(
              dexContract.address
            );

            let tx1 = await dexContract.tokenToEth(
              ethers.utils.parseEther("1")
            );

            await expect(tx1).to.emit(dexContract, "TokenToEthSwap");
            expect(await tokenContract.balanceOf(dexContract.address)).to.equal(
              balloons_bal_start.add(ethers.utils.parseEther("1"))
            );
          });
          it("Should fail without token approval", async () => {
            await expect(dexContract.connect(addr1).tokenToEth(oneEther)).to.be
              .reverted;
          });

          it("Should send less eth after the first trade (tokenToEth() called)", async function () {
            const starting_balance = await ethers.provider.getBalance(
              dexContract.address
            );

            let tx1 = await dexContract.tokenToEth(
              ethers.utils.parseEther("1")
            );

            const balance_after_swap = await ethers.provider.getBalance(
              dexContract.address
            );
            const ethSent_1 = starting_balance.sub(balance_after_swap);

            let tx2 = await dexContract.tokenToEth(
              ethers.utils.parseEther("1")
            );

            const ethSent_2 = balance_after_swap.sub(
              await ethers.provider.getBalance(dexContract.address)
            );
            expect(ethSent_2).below(ethSent_1);
          });
        });

        describe("deposit", async () => {
          it("Should deposit 1 ETH and 1 $BAL when pool at 1:1 ratio", async function () {
            let tx1 = await dexContract.deposit(
              (ethers.utils.parseEther("5"),
              {
                value: ethers.utils.parseEther("5"),
              })
            );
            expect(tx1)
              .to.emit(dexContract, "LiquidityProvided")
              .withArgs(owner.address, ethers.utils.parseEther("5"));
          });
        });

        // pool should have 5:5 ETH:$BAL ratio
        describe("withdraw", async () => {
          it("Should withdraw 1 ETH and 1 $BAL when pool at 1:1 ratio", async function () {
            let tx1 = await dexContract.withdraw(ethers.utils.parseEther("1"));

            expect(tx1)
              .to.emit(dexContract, "LiquidityRemoved")
              .withArgs(owner.address, ethers.utils.parseEther("1"));
          });
          it("Cant withdraw more than owned liquidity", async function () {
            await tokenContract.transfer(
              addr1.address,
              ethers.utils.parseEther("1")
            );
            await tokenContract
              .connect(addr1)
              .approve(dexContract.address, ethers.utils.parseEther("1"));
            await dexContract
              .connect(addr1)
              .deposit({ value: ethers.utils.parseEther("1") });

            await expect(
              dexContract.connect(addr1).withdraw(ethers.utils.parseEther("2"))
            ).to.be.revertedWith("Enter lesser amount to withdraw!");
          });
        });
        describe("It returns liquidity of a user", () => {
          it("Calls the get liquidity function", async () => {
            expect(await dexContract.getLiquidity(owner.address)).equals(
              ethers.utils.parseEther("5")
            );
          });
        });
      });
    });
  });
});
