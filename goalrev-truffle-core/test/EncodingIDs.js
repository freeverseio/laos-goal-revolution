/*
 Tests for all functions in EncodingIDs.sol and contracts inherited by it
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();;

const EncodingIDs = artifacts.require('EncodingIDs');

const fs = require('fs');

async function idWrapper(id) {
    const {0: timeZone, 1: country, 2: value} = await encoding.decodeTZCountryAndVal(id).should.be.fulfilled;
    const result = {
        encodedId: id.toString(),
        timezone: Number(timeZone), 
        country: Number(country),
        val: Number(value),
    };
    return result;
}

contract('EncodingIDs', (accounts) => {

    beforeEach(async () => {
        encoding = await EncodingIDs.new().should.be.fulfilled;
    });
   
    it('encoding of TZ and country in teamId and playerId', async () =>  {
        encoded = await encoding.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 3, val = 4).should.be.fulfilled;
        decoded = await encoding.decodeTZCountryAndVal(encoded).should.be.fulfilled;
        const {0: timeZone, 1: country, 2: value} = decoded;
        timeZone.toNumber().should.be.equal(tz);
        country.toNumber().should.be.equal(countryIdxInTZ);
        value.toNumber().should.be.equal(val);
    });

    it('get playerID of timezone 1, country 0, index in country 0', async () => {
        encoded = await encoding.encodeTZCountryAndVal(tz = 1, countryIdxInTZ = 0, indexInCountry = 0).should.be.fulfilled;
        encoded.should.be.bignumber.equal('274877906944');
    });

    it('generate tests for libraries in other platforms with from-the-filed values', async () => {
        const playerIds = [
            "1",
            "2",
            "2748779069566",
            "25738274870677750810685851804194768959071377638880076919474067",
            "25723578238440909972001807463026203175142505839389493186003577",
            "25723719228030673620200185098952752620344682551166022061130260",
            "2748779069822",
            "25734878860559155103987249282811767215868296712920203480008904",
            "2748779069607",
            "2748779070425",
            "2748779070428",
            "25723691643110835668895147749179279451641456297076820943045250",
            "25727645481606211890261219444469774369460275944657636935337471",
            "25723418858904665610591117963674276153404512539671729698505323",
            "25729717415577520843614699075047131024325410336220764501443568",
            "2748779072420",
            "25727810991124688813606251866415040864795740492992910573175831",
            "2748779069987",
            "25723719228030586046682009648439531671503057087073029908857988"
        ]

        toWrite = [];
        for (id of playerIds) {
            await toWrite.push(await idWrapper(id));
        }

        fitxer = 'test/testdata/encodingPlayerIDsDataFromTheField.json';
        fs.writeFileSync(fitxer, JSON.stringify(toWrite), function(err) {
            if (err) {
                console.log(err);
            }
        });
        
        writtenData = fs.readFileSync(fitxer, 'utf8');
        assert.equal(
            web3.utils.keccak256(writtenData),
            "0xc4a4d42318fad8c04c9061019d9a2b278d187dd863aa84a7da058e35109d5d35",
            "written testdata for playerId does not match expected result"
        );
    });

 
});