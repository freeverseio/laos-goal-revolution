const { checkTactics2ndHalf, checkTacticsGeneric } = require('./tactics');


describe('tactics', () => {
    describe('description of tests', () => {
        const data = getDefaultData();
        const tacticPatch = getDefaultPatch();

        test('default everything OK', () => {
            expect(() => checkTacticsGeneric(tacticPatch)).not.toThrow();
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 0, data, tacticPatch)).not.toThrow();
        });

        test('fails when tacticId is too large', () => {
            const tacticPatchNew = getDefaultPatch();
            tacticPatchNew.tacticId = 2;
            expect(() => checkTacticsGeneric(tacticPatchNew)).not.toThrow();
            tacticPatchNew.tacticId = 8;
            expect(() => checkTacticsGeneric(tacticPatchNew)).not.toThrow();
            tacticPatchNew.tacticId = 9;
            expect(() => checkTacticsGeneric(tacticPatchNew)).toThrow("tacticId supported only up to 8, received 9");
        });

        test('fails when shirtNum is too large', () => {
            const tacticPatchNew = getDefaultPatch();
            const NO_PLAYER = 25;
            tacticPatchNew.shirt1 = NO_PLAYER;
            expect(() => checkTacticsGeneric(tacticPatchNew)).not.toThrow();
            tacticPatchNew.shirt1 = NO_PLAYER + 1;
            expect(() => checkTacticsGeneric(tacticPatchNew)).toThrow("shirtNum too large: 26");
        });

        test('fails when substitutionShirt is too large', () => {
            const tacticPatchNew = getDefaultPatch();
            const NO_PLAYER = 25;
            tacticPatchNew.substitution0Shirt = NO_PLAYER;
            expect(() => checkTacticsGeneric(tacticPatchNew)).not.toThrow();
            tacticPatchNew.substitution0Shirt = NO_PLAYER + 1;
            expect(() => checkTacticsGeneric(tacticPatchNew)).toThrow("shirtNum too large: 26");
        });

        test('fails when substitutionTarget is too large', () => {
            const tacticPatchNew = getDefaultPatch();
            const NO_SUBST = 11;
            tacticPatchNew.substitution0Target = NO_SUBST;
            expect(() => checkTacticsGeneric(tacticPatchNew)).not.toThrow();
            tacticPatchNew.substitution0Target = NO_SUBST + 1;
            expect(() => checkTacticsGeneric(tacticPatchNew)).toThrow("substitutionTarget too large: 12");
        });

        test('fails when substitutionMinute is too large', () => {
            const tacticPatchNew = getDefaultPatch();
            tacticPatchNew.substitution0Minute = 90;
            expect(() => checkTacticsGeneric(tacticPatchNew)).not.toThrow();
            tacticPatchNew.substitution0Minute = 91;
            expect(() => checkTacticsGeneric(tacticPatchNew)).toThrow("substitutionMinute too large: 91");
        });

        test('empty spot in lineUp does not count', () => {
            const tacticPatchNew = getDefaultPatch();
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 1, data, tacticPatchNew)).toThrow("too many players aligned given the 1st half redcards: 11");
            const NO_PLAYER = 25;
            tacticPatchNew.shirt1 = NO_PLAYER;
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 1, data, tacticPatchNew)).not.toThrow();
        });

        test('player that does not exist in Universe does not count', () => {
            const tacticPatchNew = getDefaultPatch();
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 1, data, tacticPatchNew)).toThrow("too many players aligned given the 1st half redcards: 11");
            // players 19...24 are not assigned for this team in the DB
            // pointing to them may happen, for example, if previously pointed to one that was sold
            tacticPatchNew.shirt1 = 23;
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 1, data, tacticPatchNew)).not.toThrow();
        });

        test('injured player does not count', () => {
            const dataNew = getDefaultData();
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 1, dataNew, tacticPatch)).toThrow("too many players aligned given the 1st half redcards: 11");
            // players 19...24 are not assigned for this team in the DB
            // pointing to them may happen, for example, if previously pointed to one that was sold
            dataNew[0].injury_matches_left = 23;
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 1, dataNew, tacticPatch)).not.toThrow();
        });

        test('fails one red card in 1st half', () => {
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 1, data, tacticPatch)).toThrow("too many players aligned given the 1st half redcards: 11");
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 5, data, tacticPatch)).toThrow("too many players aligned given the 1st half redcards: 11");
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 13, data, tacticPatch)).toThrow("too many players aligned given the 1st half redcards: 11");
        });

        test('changes at half time: 0, 1, 2,3 work, but > 3 will fail', () => {
            const tacticPatchNew = getDefaultPatch();
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 0, data, tacticPatchNew)).not.toThrow();
            tacticPatchNew.shirt0 = 14;
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 0, data, tacticPatchNew)).not.toThrow();
            tacticPatchNew.shirt3 = 15;
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 0, data, tacticPatchNew)).not.toThrow();
            tacticPatchNew.shirt5 = 16;
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 0, data, tacticPatchNew)).not.toThrow();
            tacticPatchNew.shirt8 = 17;
            expect(() => checkTactics2ndHalf(nRedCards1stHalf = 0, data, tacticPatchNew)).toThrow("too many changes at half time");
        });
    });
});

function getDefaultData() {
    data = [];
    encodedSkillsAlignedPlayer = '5986310706507378352962293074805895248510699696029696'; 
    encodedSkillsNotAlignedPlayer = '15324956156947726902719058204642840311988711972191687672616'; 
    for (p = 0; p < 11; p++) {
        data.push({ 
            "encoded_skills": encodedSkillsAlignedPlayer,
            "shirt_number": p,
            "red_card": false,
            "injury_matches_left": 0,
            "timezone_idx": 4,
            "country_idx": 0,
            "league_idx": 0,
            "match_day_idx": 1,
        });
    }
    for (p = 11; p < 18; p++) {
        data.push({ 
            "encoded_skills": encodedSkillsNotAlignedPlayer,
            "shirt_number": p,
            "red_card": false,
            "injury_matches_left": 0,
            "timezone_idx": 4,
            "country_idx": 0,
            "league_idx": 0,
            "match_day_idx": 1,
        });
    }
    return data;
}

function getDefaultPatch() {
    return {
        tacticId: 8,
        shirt0: 0,
        shirt1: 1,
        shirt2: 2,
        shirt3: 3,
        shirt4: 4,
        shirt5: 5,
        shirt6: 6,
        shirt7: 7,
        shirt8: 8,
        shirt9: 9,
        shirt10: 10,
        substitution0Shirt: 25,
        substitution0Target: 11,
        substitution0Minute: 0,
        substitution1Shirt: 25,
        substitution1Target: 10,
        substitution1Minute: 0,
        substitution2Shirt: 25,
        substitution2Target: 10,
        substitution2Minute: 0,
        extraAttack1: false,
        extraAttack2: false,
        extraAttack3: false,
        extraAttack4: false,
        extraAttack5: false,
        extraAttack6: false,
        extraAttack7: false,
        extraAttack8: false,
        extraAttack9: false,
        extraAttack10: false 
    };
}