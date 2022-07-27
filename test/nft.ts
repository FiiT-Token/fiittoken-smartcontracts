import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Verify Contract", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  let drakonContract: any;

  beforeEach("deploy contract", async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const FiitTokenDrakonPlusContact = await ethers.getContractFactory(
      "FiitTokenDrakonPlus"
    );

    drakonContract = await FiitTokenDrakonPlusContact.deploy("https://");
    await drakonContract.deployed();
  });

  it("1) Success: Reserved Nft", async function () {
    const amount = 200;
    await drakonContract.reserveNFTs(amount);

    const balance = await drakonContract.balanceOf(owner.address);

    expect(balance.toNumber()).to.equal(amount);
  });

  it("2) Success: Export Nft", async function () {
    const amount = 1;
    const tokenId = 0;
    const nonce = 1;
    await drakonContract.reserveNFTs(amount);

    // Compute hash of the address
    const messageHash = await drakonContract.getMessageHash(
      addr1.address,
      tokenId, // token id
      nonce // nonce
    );

    await drakonContract.approve(
      addr1.address,
      tokenId // nonce
    );

    // Sign the hashed address
    const messageBytes = ethers.utils.arrayify(messageHash);
    const signature = await owner.signMessage(messageBytes);

    await drakonContract.connect(addr1).exportNft(tokenId, nonce, signature);

    const tokenOneOwnerAddress = await drakonContract.ownerOf(tokenId);

    expect(tokenOneOwnerAddress).to.equal(addr1.address);
  });

  it("3) Failed: Export Nft wrong signature", async function () {
    const amount = 1;
    await drakonContract.reserveNFTs(amount);

    // Compute hash of the address
    const messageHash = await drakonContract.getMessageHash(
      addr1.address,
      0, // token id
      1 // nonce
    );

    // Sign the hashed address
    const messageBytes = ethers.utils.arrayify(messageHash);
    const signature = await owner.signMessage(messageBytes);

    await expect(
      drakonContract.connect(addr2).exportNft(0, messageHash, signature)
    ).to.be.revertedWith("Export: Invalid signature");
  });
});
