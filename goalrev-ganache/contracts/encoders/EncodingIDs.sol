pragma solidity >= 0.6.3;

/**
 @title Library of pure functions to serialize/deserialize IDs: playerId, countryID, etc
 @author Freeverse.io, www.freeverse.io
 @dev The structure of the Assets Universe is: there are 24 timezones (TZs)
 @dev ... TZs range from 1,..24 (tz = 0 is Null)
 @dev Each TZ has countries labeled by countryIdxInTZ = 0,.. 2**10-1
 @dev Each country has teams or players, each labeled from 0,...2**28-1
*/

contract EncodingIDs {

    /**
     * @dev PlayerId and TeamId both serialize a total of 43 bits:
     *      timeZone        = 5 bits
     *      countryIdxInTZ  = 10 bits
     *      val             = 28 bits (either  (playerIdxInCountry or teamIdxInCountry)
    **/
    function encodeTZCountryAndVal(uint8 timeZone, uint256 countryIdxInTZ, uint256 val) public pure returns (uint256)
    {
        require(timeZone < 2**5, "timezone out of bound");
        require(countryIdxInTZ < 2**10, "countryIdxInTZ out of bound");
        require(val < 2**28, "val to encode out of bound");
        uint256 encoded  = uint256(timeZone) << 38;        /// 43 - 5
        encoded         |= countryIdxInTZ << 28;  /// 38 - 10
        return (encoded | val);            /// 28 - 28
    }

    /**
    @return timezone, countryIdxInTZ, val
     */
    function decodeTZCountryAndVal(uint256 encoded) public pure returns (uint8, uint256, uint256)
    {
        /// 2**14 - 1 = 31;  2**10 - 1 = 1023; 2**28 - 1 = 268435455;
        return (uint8(encoded >> 38 & 31), uint256(encoded >> 28 & 1023), uint256(encoded & 268435455));
    }

}
