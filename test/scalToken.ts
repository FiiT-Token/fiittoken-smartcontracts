import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SCAL Token", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach("get addess owner", async () => {
    [owner, addr1] = await ethers.getSigners();
  });

  it("1) Add address to white list add mint token to address", async function () {
    const ScalTokenContract = await ethers.getContractFactory("ScalToken");
    const scalToken = await ScalTokenContract.deploy();
    await scalToken.deployed();
    const amount = 1000000;

    // add address to white list
    await scalToken.addToWhiteList(owner.address);

    // mint to other address
    await scalToken.mint(addr1.address, amount);

    const balance = await scalToken.balanceOf(addr1.address);

    expect(balance.toNumber()).to.equal(amount);
  });

  it("2) mint token without add to white list", async function () {
    const ScalTokenContract = await ethers.getContractFactory("ScalToken");
    const scalToken = await ScalTokenContract.deploy();
    await scalToken.deployed();
    const amount = 1000000;

    // mint to other address
    await expect(scalToken.mint(addr1.address, amount)).to.be.revertedWith(
      "Ownable: caller is not in white list"
    );
  });
});
