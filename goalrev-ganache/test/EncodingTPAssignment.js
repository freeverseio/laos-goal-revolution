/*
 Tests for all functions in EncodingTPAssignment.sol and contracts inherited by it
*/
const BN = require('bn.js');
require('chai')
    .use(require('chai-as-promised'))
    .use(require('chai-bn')(BN))
    .should();;

const EncodingTPAssignment = artifacts.require('EncodingTPAssignment');
const fs = require('fs');

function BNArrayToNumber(BNArray) {
    numbers = [];
    for (big of BNArray) { numbers.push(Number(big))}
    return numbers;
}

async function TPWrapper(encoded) {
    const {0: TPperSkill, 1: specialPlayer, 2: TP, 3: err} = await encoding.decodeTP(encoded).should.be.fulfilled;

    const result = {
        encodedTPAssignment: encoded.toString(),
        TPperSkill: BNArrayToNumber(TPperSkill), 
        specialPlayer: Number(specialPlayer),
        TP: Number(TP),
        err: Number(err),
    };
    return result;
}

async function encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer) {
    const result = await encoding.encodeTP(TP, TPperSkill, specialPlayer).should.be.fulfilled;
    return result;
}

contract('EncodingTPAssignment', (accounts) => {

    const it2 = async(text, f) => {};

    beforeEach(async () => {
        encoding = await EncodingTPAssignment.new().should.be.fulfilled;
        MAX_PERCENT = await encoding.MAX_PERCENT().should.be.fulfilled;
        MAX_PERCENT = MAX_PERCENT.toNumber();
    });
    
    it('encode minimal TP', async () =>  {
        specialPlayer = 21;
        TP = 2;
        TPperSkill =  Array.from(new Array(25), (x,i) => 0);
        for (bucket = 0; bucket < 5; bucket++) {
            TPperSkill[5*bucket] = 1;
            TPperSkill[5*bucket + 1] = 1;
        }
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        result = await encoding.decodeTP(result).should.be.fulfilled;
        specialPlayer = 21;
        TP = 1;
        TPperSkill =  Array.from(new Array(25), (x,i) => 0);
        for (bucket = 0; bucket < 5; bucket++) {
            TPperSkill[5*bucket] = 1;
        }
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        result = await encoding.decodeTP(result).should.be.fulfilled;
        result = await encoding.encodeTP(TP = 0, TPperSkill, specialPlayer).should.be.rejected;
    })
    
    it('encode minimal TP and see that 60 percent restriction only operates at TP = 4', async () =>  {
        specialPlayer = 21;
        TP = 2;
        TPperSkill =  Array.from(new Array(25), (x,i) => 0);
        for (bucket = 0; bucket < 5; bucket++) {
            TPperSkill[5*bucket] = 2;
        }
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        result = await encoding.decodeTP(result).should.be.fulfilled;

        TP = 3;
        TPperSkill =  Array.from(new Array(25), (x,i) => 0);
        for (bucket = 0; bucket < 5; bucket++) {
            TPperSkill[5*bucket] = 3;
        }
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        result = await encoding.decodeTP(result).should.be.fulfilled;

        TP = 3;
        TPperSkill =  Array.from(new Array(25), (x,i) => 0);
        for (bucket = 0; bucket < 5; bucket++) {
            TPperSkill[5*bucket] = 2;
            TPperSkill[5*bucket+1] = 1;
        }
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        result = await encoding.decodeTP(result).should.be.fulfilled;

        TP = 4;
        TPperSkill =  Array.from(new Array(25), (x,i) => 0);
        for (bucket = 0; bucket < 5; bucket++) {
            TPperSkill[5*bucket] = 4;
        }
        result = await encoding.encodeTP(TP, TPperSkill, specialPlayer).should.be.rejected;

        TP = 4;
        TPperSkill =  Array.from(new Array(25), (x,i) => 0);
        for (bucket = 0; bucket < 5; bucket++) {
            TPperSkill[5*bucket] = 3;
            TPperSkill[5*bucket] = 1;
        }
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        result = await encoding.decodeTP(result).should.be.fulfilled;
    })
    
    
    
    it('encode fails if sum is not correct', async () =>  {
        specialPlayer = 21;
        TP = 40;
        TPperSkill =  Array.from(new Array(25), (x,i) => Math.floor(TP/5));
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        // sum too large:
        TPperSkill =  Array.from(new Array(25), (x,i) => 1 + Math.floor(TP/5));
        result = await encoding.encodeTP(TP, TPperSkill, specialPlayer).should.be.rejected;
        // special player can have extra 10 percent:
        TPperSkill =  Array.from(new Array(25), (x,i) => Math.floor(TP/5));
        // special player belongs to idx: 20, 21, 22, 23, 24
        // having an extra 10% he should be able to reach 44 points => (8,8,8,8,8) -> 9,8,9,9,9
        TPperSkill[20] = 9;
        TPperSkill[21] = 8;
        TPperSkill[22] = 9;
        TPperSkill[23] = 9;
        TPperSkill[24] = 9;
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        TPperSkill[24] = 10;
        result = await encoding.encodeTP(TP, TPperSkill, specialPlayer).should.be.rejected;
    });

    it('encode and decode TP assignment', async () =>  {
        specialPlayer = 21;
        TP = 40;
        TPperSkill = Array.from(new Array(25), (x,i) => 3 + 3*i % 5);
        // make sure they sum to TP:
        for (bucket = 0; bucket < 5; bucket++){
            sum4 = 0;
            for (sk = 5 * bucket; sk < (5 * bucket + 4); sk++) {
                sum4 += TPperSkill[sk];
            }
            TPperSkill[5 * bucket + 4] = TP - sum4;
        }        
        result = await encodeTPAndPrintOut(encoding, TP, TPperSkill, specialPlayer);
        decoded = await encoding.decodeTP(result).should.be.fulfilled;
        for (bucket = 0; bucket < 5; bucket++){
            sum = 0;
            for (sk = 0; sk < 5; sk++) {
                decoded.TPperSkill[5*bucket + sk].toNumber().should.be.equal(TPperSkill[5*bucket + sk]);
                sum += decoded.TPperSkill[5*bucket + sk].toNumber();
            }
            (0*decoded.specialPlayer.toNumber() + sum).should.be.equal(TP);
        }
        decoded.specialPlayer.toNumber().should.be.equal(specialPlayer);
        decoded.TP.toNumber().should.be.equal(TP);
    });

    it('generate tests for libraries in other platforms with from-the-filed values', async () => {
        const encodedTPs = [
            "579854532917076746873910624714946855702109768676713012977276363397399041",
            "579800613023741660956604367327376591768553336462730086632520089805520897",
            "579854532917075963768689242223483045531213519263147702631388144811900930",
            "579908452810410266580774117119589499293873702063565318630256199818280963",
            "579908452810411049685995499611053309464769951477130628976144418403779074",
            "579962372703744564795372369417898709552595159329265330067406711467016193",
            "581904333010837480581002275697412515336674102113005658994096679113723912",
            "581904438529218954846900017319585695708207551931882777114590236735705096",
            "581905596551040918655833326684946888213903033721653058205969989931895811"
        ]

        toWrite = [];
        for (encodedTP of encodedTPs) {
            await toWrite.push(await TPWrapper(encodedTP));
        }

        fitxer = 'test/testdata/encodingTPsData.json';
        fs.writeFileSync(fitxer, JSON.stringify(toWrite), function(err) {
            if (err) {
                console.log(err);
            }
        });
        
        writtenData = fs.readFileSync(fitxer, 'utf8');
        assert.equal(
            web3.utils.keccak256(writtenData),
            "0x7a4e75ce4ad6ff093fbe9ab74ba31dc2742b25b69e2de80ae2bc6ad7d212bbad",
            "written testdata for encoding TPs does not match expected result"
        );
    });


});