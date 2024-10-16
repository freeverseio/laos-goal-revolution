const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  compilers: {
    solc: {
      version: "0.6.3", // A version or constraint - Ex. "^0.5.0"
                         // Can also be set to "native" to use a native solc
      parser: "solcjs",  // Leverages solc-js purely for speedy parsing
      settings: {
        optimizer: {
          enabled: true,
        }
      }
    }
  },
  networks: {
    ganache: {
      network_id: '*',
      host: '127.0.0.1',
      port: 8545
    },
    local: { // 0x83A909262608c650BD9b0ae06E29D90D0F67aC5e
      provider: new HDWalletProvider(
        "FE058D4CE3446218A7B4E522D9666DF5042CF582A44A9ED64A531A81E7494A85",
        "http://localhost:8545"
      ),
      network_id: 63819,
      singleTimezone: 1,
      requiredStake: 1,
      owners: {
        company: "0x83A909262608c650BD9b0ae06E29D90D0F67aC5e",
        superuser: "0x83A909262608c650BD9b0ae06E29D90D0F67aC5e",
        COO: "0x83A909262608c650BD9b0ae06E29D90D0F67aC5e",
        market: "0x83A909262608c650BD9b0ae06E29D90D0F67aC5e",
        relay: "0x83A909262608c650BD9b0ae06E29D90D0F67aC5e",
        trustedParties: ["0x83A909262608c650BD9b0ae06E29D90D0F67aC5e"]
      },
    },
  },

  // Set default mocha options here, use special reporters etc.
  // mocha: {
  //   reporter: 'eth-gas-reporter',
  //   timeout: 100000
  // }
}
