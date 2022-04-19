import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("FIIT Token", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let fiitToken: any;

  beforeEach("get addess owner", async () => {
    [owner, addr1] = await ethers.getSigners();

    const FiitTokenContract = await ethers.getContractFactory("FiitToken");
    fiitToken = await FiitTokenContract.deploy();
    await fiitToken.deployed();
  });

  it("1) Add address to white list add mint token to address", async function () {
    const amount = 1000000;

    // add address to white list
    await fiitToken.addToWhiteList(owner.address);

    // mint to other address
    await fiitToken.mint(addr1.address, amount);

    const balance = await fiitToken.balanceOf(addr1.address);

    expect(balance.toNumber()).to.equal(amount);
  });

  it("2) mint token without add to white list", async function () {
    const amount = 1000000;

    // mint to other address
    await expect(fiitToken.mint(addr1.address, amount)).to.be.revertedWith(
      "Ownable: caller is not in white list"
    );
  });

  it("3)remove from white list", async function () {
    // check is not in white list
    expect(await fiitToken.isInWhiteList(owner.address)).to.equal(false);

    // add address to white list
    await fiitToken.addToWhiteList(owner.address);

    // check is in white list
    expect(await fiitToken.isInWhiteList(owner.address)).to.equal(true);

    await fiitToken.removeFromWhiteList(owner.address);

    // check is not in white list
    expect(await fiitToken.isInWhiteList(owner.address)).to.equal(false);
  });
});
