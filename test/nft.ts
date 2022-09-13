import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Verify Contract", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  let drakonContract: any;
  let nftConverterContact: any;

  beforeEach("deploy contract", async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const FiitTokenDrakonPlusContact = await ethers.getContractFactory(
      "FiitTokenDrakonPlus"
    );

    drakonContract = await FiitTokenDrakonPlusContact.deploy();
    await drakonContract.deployed();

    const NftConverterContact = await ethers.getContractFactory("NftConverter");

    nftConverterContact = await NftConverterContact.deploy(
      drakonContract.address,
      owner.address
    );

    await nftConverterContact.deployed();
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
    const messageHash = await nftConverterContact.getMessageHash(
      addr1.address,
      tokenId, // token id
      nonce // nonce
    );

    // set approve for nft converter contact can transfer owner to another address
    await drakonContract.setApprovalForAll(nftConverterContact.address, true);

    // Sign the hashed address
    const messageBytes = ethers.utils.arrayify(messageHash);
    const signature = await owner.signMessage(messageBytes);

    await nftConverterContact
      .connect(addr1)
      .exportNft(tokenId, nonce, signature);

    const tokenOneOwnerAddress = await drakonContract.ownerOf(tokenId);

    expect(tokenOneOwnerAddress).to.equal(addr1.address);
  });

  it("3) Failed: Address request signature not same with address use signature", async function () {
    const amount = 1;
    const tokenId = 0;
    const nonce = 1;
    await drakonContract.reserveNFTs(amount);

    // Compute hash of the address
    const messageHash = await nftConverterContact.getMessageHash(
      addr1.address,
      tokenId, // token id
      nonce // nonce
    );

    // set approve for nft converter contact can transfer owner to another address
    await drakonContract.setApprovalForAll(nftConverterContact.address, true);

    // Sign the hashed address
    const messageBytes = ethers.utils.arrayify(messageHash);
    const signature = await owner.signMessage(messageBytes);

    await expect(
      nftConverterContact.connect(addr2).exportNft(tokenId, nonce, signature)
    ).to.be.revertedWith("Export: Invalid signature");
  });

  it("4) Failed: Wrong signer", async function () {
    const amount = 1;
    const tokenId = 0;
    const nonce = 1;
    await drakonContract.reserveNFTs(amount);

    // Compute hash of the address
    const messageHash = await nftConverterContact.getMessageHash(
      addr1.address,
      tokenId, // token id
      nonce // nonce
    );

    // set approve for nft converter contact can transfer owner to another address
    await drakonContract.setApprovalForAll(nftConverterContact.address, true);

    // Sign the hashed address
    const messageBytes = ethers.utils.arrayify(messageHash);
    const signature = await addr1.signMessage(messageBytes);

    await expect(
      nftConverterContact.connect(addr2).exportNft(tokenId, nonce, signature)
    ).to.be.revertedWith("Export: Invalid signature");
  });
});
