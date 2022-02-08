const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "REDACTED";

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
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/REDACTED")
      },
      network_id: 3
    }
  }
};
