import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Verify Contract", function () {
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  let drakonContract: any;
  let drakonContract1: any;
  let nftConverterContact: any;

  const exportNft = async (tokenId: number) => {
    const amount = 1;
    const nonce = 1;
    await drakonContract.reserveNFTs(amount);

    // Compute hash of the address
    const messageHash = await nftConverterContact.getMessageHash(
      addr1.address,
      tokenId, // token id
      "export",
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
  };

  const importNft = async (tokenId: number) => {
    const nonce = 1;

    // Compute hash of the address
    const messageHash = await nftConverterContact.getMessageHash(
      addr1.address,
      tokenId, // token id
      "import",
      nonce // nonce
    );

    // set approve for nft converter contact can transfer owner to another address
    await drakonContract
      .connect(addr1)
      .approve(nftConverterContact.address, tokenId);

    // Sign the hashed address
    const messageBytes = ethers.utils.arrayify(messageHash);
    console.log("messageBytes: ", messageBytes);
    const signature = await addr1.signMessage(messageBytes);

    await nftConverterContact
      .connect(addr1)
      .importNft(tokenId, nonce, signature);
  };

  beforeEach("deploy contract", async () => {
    [owner, addr1, addr2] = await ethers.getSigners();

    const FiitTokenDrakonPlusContact = await ethers.getContractFactory(
      "FiitTokenDrakonPlus"
    );

    drakonContract = await FiitTokenDrakonPlusContact.deploy();
    await drakonContract.deployed();

    drakonContract1 = await FiitTokenDrakonPlusContact.deploy();
    await drakonContract1.deployed();

    const NftConverterContact = await ethers.getContractFactory("NftConverter");

    nftConverterContact = await NftConverterContact.deploy();

    await nftConverterContact.deployed();
    nftConverterContact.setNftAddress(drakonContract.address);
    nftConverterContact.setNftOwnerAddress(owner.address);
  });

  it("1) Success: Reserved Nft", async function () {
    const amount = 200;
    await drakonContract.reserveNFTs(amount);

    const balance = await drakonContract.balanceOf(owner.address);

    expect(balance.toNumber()).to.equal(amount);
  });

  it("2) Success Export: Export Nft", async function () {
    const tokenId = 0;
    await exportNft(tokenId);
    const tokenOneOwnerAddress = await drakonContract.ownerOf(tokenId);

    expect(tokenOneOwnerAddress).to.equal(addr1.address);
  });

  it("3) Failed Export: Address request signature not same with address use signature", async function () {
    const amount = 1;
    const tokenId = 0;
    const nonce = 1;
    await drakonContract.reserveNFTs(amount);

    // Compute hash of the address
    const messageHash = await nftConverterContact.getMessageHash(
      addr1.address,
      tokenId, // token id
      "export",
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

  it("4) Failed Export: Wrong signer", async function () {
    const amount = 1;
    const tokenId = 0;
    const nonce = 1;
    await drakonContract.reserveNFTs(amount);

    // Compute hash of the address
    const messageHash = await nftConverterContact.getMessageHash(
      addr1.address,
      tokenId, // token id
      "export",
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

  it("5) Success Import: Import NFT", async function () {
    const tokenId = 0;
    await exportNft(tokenId);

    await importNft(tokenId);

    const tokenOneOwnerAddress = await drakonContract.ownerOf(tokenId);

    expect(tokenOneOwnerAddress).to.equal(owner.address);
  });

  it("6) Success: Set nft address", async function () {
    await nftConverterContact.setNftAddress(drakonContract1.address);
    const nftAddr = await nftConverterContact.getNftAddress();

    expect(drakonContract1.address).to.equal(nftAddr);
  });
});
