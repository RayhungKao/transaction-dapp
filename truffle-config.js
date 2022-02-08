const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic = "kitchen jump garage nation quick primary siege filter trash brain affair please";

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
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/af03294c72c44ac9b2d4638cf9b92769")
      },
      network_id: 3
    }
  }
};
