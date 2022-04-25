import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Verify Contract", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let verifyContract: any;
  let scalToken: any;

  beforeEach("deploy contract", async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const VerfiyContract = await ethers.getContractFactory("VerifySignature");
    verifyContract = await VerfiyContract.deploy();
    await verifyContract.deployed();

    const ScalTokenContract = await ethers.getContractFactory("ScalToken");
    scalToken = await ScalTokenContract.deploy();
    await scalToken.deployed();

    // add address to white list
    await scalToken.addToWhiteList(verifyContract.address);
  });

  it("1) Verify and mint token to user", async function () {
    const amount = 1000000;

    const hashMessage = await verifyContract.getMessageHash(
      addr1.address,
      scalToken.address,
      amount,
      1
    );

    const provider = ethers.provider;

    const signature = String(
      await provider.send("personal_sign", [
        hashMessage,
        owner.address.toLocaleLowerCase(),
      ])
    );

    await verifyContract.verifyAndMint(
      addr1.address,
      scalToken.address,
      amount,
      1,
      signature
    );

    const balance = await scalToken.balanceOf(addr1.address);

    expect(balance.toNumber()).to.equal(amount);
  });

  it("2) Not use owner address sign message ", async function () {
    const amount = 1000000;

    const hashMessage = await verifyContract.getMessageHash(
      addr1.address,
      scalToken.address,
      amount,
      1
    );

    const provider = ethers.provider;

    const signature = String(
      await provider.send("personal_sign", [
        hashMessage,
        addr2.address.toLocaleLowerCase(),
      ])
    );

    // mint to other address
    await expect(
      verifyContract.verifyAndMint(
        addr1.address,
        scalToken.address,
        amount,
        1,
        signature
      )
    ).to.be.revertedWith("Verify: Not authorize address");
  });
});
