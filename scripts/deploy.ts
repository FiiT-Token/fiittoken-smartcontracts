// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const ScalTokenContract = await ethers.getContractFactory("ScalToken");
  const scalToken = await ScalTokenContract.deploy();
  const FiitTokenContract = await ethers.getContractFactory("FiitToken");
  const fiitToken = await FiitTokenContract.deploy();

  await fiitToken.deployed();
  await scalToken.deployed();

  console.log("FitToken deployed to:", fiitToken.address);
  console.log(
    "Checkout Fit Token code via: " +
      process.env.BSCSCAN_TESTNET_URL +
      "address/" +
      fiitToken.address
  );

  console.log("ScalToken deployed to:", scalToken.address);
  console.log(
    "Checkout Scal Token code via: " +
      process.env.BSCSCAN_TESTNET_URL +
      "address/" +
      scalToken.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
