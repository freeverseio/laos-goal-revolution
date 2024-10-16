# Contracts Organization

## Folder contracts/storage

Contains the three critical contracts that manage storage: Proxy, Stakers, MarketCrypto

* Proxy (cannot hold money)
  * Mission: asset creation, market in FIAT (operated by Freeverse), user actions relays, updates and challenges.
  * The contract is so big that it had to use a delegate call pattern. It delegates to 4 contracts. The names are not really 1-to-1 with the functions they perform, but almost:
    * Assets
    * Market
    * Updates
    * Challenges 
  * The basic inheritance that is critical to manage the storage is:
    * ProxyStorage -> Proxy
    * ProxyStorage -> Storage -> UniverseInfo -> Assets
    * ProxyStorage -> Storage -> UniverseInfo -> Market
    * ProxyStorage -> Storage -> UniverseInfo -> Updates
    * ProxyStorage -> Storage -> UniverseInfo -> Challenges
  * The agreed permissioning of each function is documented [here](https://github.com/freeverseio/lioneldoc/blob/master/authorizations.md)

* Stakers (holds money)
  * Mission: accepts stakers, manages their stake, offers rewards. It is slaved to receving calls from Proxy, whwere all the update-challenge logic resides.
  * Stakers finite state machine is in slide 13 of [this GoogleSlides](https://docs.google.com/presentation/d/1LuqDhVnwTKULu8zJCxuKNc9sArvv0ITCG4r0_hrODFU/edit?usp=sharing)
  
* MarketCrypto (holds money)
  * Mission: to operate the same auctions logic as the market in fiat, but in crypto, without anyone's permission.

## Folder contracts/gameEngine

Libraries with the logic about playing matches, calendars, evolutions, etc.
* **All functions are Pure**, except for several, which are basically pure too... but they had to be turned into View because they were so large that they needed to call among themselves. They keep their addresses in storage. We may turn these into Pure in the future by passing the addresses as calldata.
  
## Folder contracts/encoders

Pure functions for serializing/deserializing small pieces of data into uint256

## Folder contracts/interfaces

View/pure functions for backend clients.


