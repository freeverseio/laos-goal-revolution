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
    xdai: { // 0xA9c0F76cA045163E28afDdFe035ec76a44f5C1F3
      provider: new HDWalletProvider(
        "a98c8730d71a46bcc40fb06fc68142edbc2fdf17b89197db0fbe41d35718d5fc",
        "https://dai.poa.network" // if it fails, try this one: "http://node1.goalrevolution.live:9999/"
      ),
      network_id: 100,
      gasPrice: 1000000000,
      singleTimezone: -1,
      requiredStake: 1,
      owners: {
        company: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        superuser: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        COO: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        market: "0x833cf74EC5db0751Bf8F31321655A09f19805663",
        relay: "0x8Aaef2250eA71Fc5Fde26373F8AEA7C9f600AF93",
        trustedParties: ["0x886907C2D5231B590514b2B0a1651A104cAD1A43"]
      },
    },
    xdaidev: { // 0xA9c0F76cA045163E28afDdFe035ec76a44f5C1F3
      provider: new HDWalletProvider(
        "a98c8730d71a46bcc40fb06fc68142edbc2fdf17b89197db0fbe41d35718d5fc",
        "https://dai.poa.network"
      ),
      network_id: 100,
      gasPrice: 1000000000,
      singleTimezone: -1,
      requiredStake: 1,
      owners: {
        company: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        superuser: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        COO: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        market: "0x448e4B85C041333eEd6C25c5dD4E3353536CDE17",
        relay: "0x83207C27D6B7926ded479d0FA25e12cC34BF5f43",
        trustedParties: ["0xDea2aa21c384D8cb79eB72eD76A214bb9f44cb79"]
      },
    },
    upgradexdaidev: { // 0xA9c0F76cA045163E28afDdFe035ec76a44f5C1F3
      provider: new HDWalletProvider(
        "a98c8730d71a46bcc40fb06fc68142edbc2fdf17b89197db0fbe41d35718d5fc",
        "https://dai.poa.network"
      ),
      network_id: 100,
      gasPrice: 1000000000,
      singleTimezone: -1,
      requiredStake: 1,
      owners: {
        company: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        superuser: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        COO: "0x7c34471e39c4A4De223c05DF452e28F0c4BD9BF0",
        market: "0x448e4B85C041333eEd6C25c5dD4E3353536CDE17",
        relay: "0x83207C27D6B7926ded479d0FA25e12cC34BF5f43",
        trustedParties: ["0xDea2aa21c384D8cb79eB72eD76A214bb9f44cb79"]
      },
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
