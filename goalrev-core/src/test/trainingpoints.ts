const { ethers } = require("ethers");
const fs = require("fs");

const tp = async () => {
  const abiPath = "../contracts/abi/TrainingPoints.json";
  const contractABI = JSON.parse(fs.readFileSync(abiPath));
  console.log("tp");
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const contract = new ethers.Contract(
    "0xA57B8a5584442B467b4689F1144D269d096A3daF",
    contractABI.abi,
    provider

  );
  const decodetedTp = await contract.decodeTP("581904438529218954846900017319585695708207551931882777114590236735705096");
  console.log(decodetedTp);
  for (const skill of decodetedTp.TPperSkill) {
    console.log(skill.toString());
  }
}

tp();