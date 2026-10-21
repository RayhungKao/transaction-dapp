const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
// Deployment secrets come from the environment, never from this file:
// MNEMONIC="<12 words>" INFURA_PROJECT_ID="<id>" truffle migrate --network ropsten
const { MNEMONIC, INFURA_PROJECT_ID } = process.env;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  compilers: {
    solc: {
      version: '^0.8.11',
    },
  },
  networks: {
    develop: {
      port: 8545,
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(MNEMONIC, `https://ropsten.infura.io/v3/${INFURA_PROJECT_ID}`)
      },
      network_id: 3
    }
  }
};
