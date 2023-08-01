require("@nomiclabs/hardhat-waffle");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/<YOUR_INFURA_KEY>"
      }
    }
  }
};