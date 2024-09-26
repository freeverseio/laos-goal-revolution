const { checkTrainingGroup, checkTrainingSpecialPlayer } = require('./training');

describe('training', () => {
    describe('group', () => {
        const TP = 10;

        test('group with sum 0', () => {
            expect(() => checkTrainingGroup(TP, 0, 0, 0, 0, 0)).not.toThrow();
        });

        test('group with sum exceeding the TP', () => {
            expect(() => checkTrainingGroup(TP, 5, 5, 5, 0, 0)).toThrow("group sum 15 exceeds available TP 10");
        });

        test('each element is 60% of TP', () => {
            expect(() => checkTrainingGroup(TP, 6, 0, 0, 0, 0)).not.toThrow();
            expect(() => checkTrainingGroup(TP, 0, 6, 0, 0, 0)).not.toThrow();
            expect(() => checkTrainingGroup(TP, 0, 0, 6, 0, 0)).not.toThrow();
            expect(() => checkTrainingGroup(TP, 0, 0, 0, 6, 0)).not.toThrow();
            expect(() => checkTrainingGroup(TP, 0, 0, 0, 0, 6)).not.toThrow();
        });

        test('each element exceeding 60% of TP', () => {
            expect(() => checkTrainingGroup(TP, 7, 0, 0, 0, 0)).toThrow("shoot exceeds 60% of TP 10");
            expect(() => checkTrainingGroup(TP, 0, 7, 0, 0, 0)).toThrow("speed exceeds 60% of TP 10");
            expect(() => checkTrainingGroup(TP, 0, 0, 7, 0, 0)).toThrow("pass exceeds 60% of TP 10");
            expect(() => checkTrainingGroup(TP, 0, 0, 0, 7, 0)).toThrow("defence exceeds 60% of TP 10");
            expect(() => checkTrainingGroup(TP, 0, 0, 0, 0, 7)).toThrow("endurance exceeds 60% of TP 10");
        });

        test('group with sum < TP', () => {
            expect(() => checkTrainingGroup(TP, 2, 2, 2, 1, 2)).not.toThrow();
        });
    });

    describe('special player', () => {
        const TP = 10;

        test('group with sum 0', () => {
            expect(() => checkTrainingSpecialPlayer(TP, 0, 0, 0, 0, 0)).not.toThrow();
        });

        test('group with sum exceeding the TP', () => {
            expect(() => checkTrainingSpecialPlayer(TP, 5, 5, 5, 0, 0)).toThrow("group sum 15 exceeds available TP 11");
        });

        test('each element is 60% of TP', () => {
            expect(() => checkTrainingSpecialPlayer(TP, 6, 0, 0, 0, 0)).not.toThrow();
            expect(() => checkTrainingSpecialPlayer(TP, 0, 6, 0, 0, 0)).not.toThrow();
            expect(() => checkTrainingSpecialPlayer(TP, 0, 0, 6, 0, 0)).not.toThrow();
            expect(() => checkTrainingSpecialPlayer(TP, 0, 0, 0, 6, 0)).not.toThrow();
            expect(() => checkTrainingSpecialPlayer(TP, 0, 0, 0, 0, 6)).not.toThrow();
        });

        test('each element exceeding 60% of TP', () => {
            expect(() => checkTrainingSpecialPlayer(TP, 7, 0, 0, 0, 0)).toThrow("shoot exceeds 60% of TP 11");
            expect(() => checkTrainingSpecialPlayer(TP, 0, 7, 0, 0, 0)).toThrow("speed exceeds 60% of TP 11");
            expect(() => checkTrainingSpecialPlayer(TP, 0, 0, 7, 0, 0)).toThrow("pass exceeds 60% of TP 11");
            expect(() => checkTrainingSpecialPlayer(TP, 0, 0, 0, 7, 0)).toThrow("defence exceeds 60% of TP 11");
            expect(() => checkTrainingSpecialPlayer(TP, 0, 0, 0, 0, 7)).toThrow("endurance exceeds 60% of TP 11");
        });

        test('group with sum < TP', () => {
            expect(() => checkTrainingSpecialPlayer(TP, 2, 2, 2, 1, 2)).not.toThrow();
        });

        test('all null', () => {
            expect(() => checkTrainingSpecialPlayer(47, undefined, undefined, undefined, undefined, undefined)).toThrow("invalid params");
        });
    });
    
    describe('low TPs: special player', () => {
        const TP = 7;

        test('group with sum 0', () => {
            expect(() => checkTrainingSpecialPlayer(TP, 0, 0, 0, 0, 0)).not.toThrow();
        });

        test('group with sum = TP', () => {
            expect(() => checkTrainingSpecialPlayer(TP, 3, 4, 0, 0, 0)).not.toThrow();
        });

        test('group with sum = TP + 1', () => {
            expect(() => checkTrainingSpecialPlayer(TP, 4, 4, 0, 0, 0)).toThrow("group sum 8 exceeds available TP 7");
        });
    });
    
    describe('super low TP vals: TP = 1', () => {
        const TP = 1;

        test('group with small sums', () => {
            expect(() => checkTrainingGroup(TP, 0, 0, 0, 0, 0)).not.toThrow();
            expect(() => checkTrainingGroup(TP, 1, 0, 0, 0, 0)).not.toThrow();
            expect(() => checkTrainingGroup(TP, 2, 0, 0, 0, 0)).toThrow("group sum 2 exceeds available TP 1");
        });
    });

    describe('super low TP vals: TP = 0', () => {
        const TP = 0;

        test('group with small sums', () => {
            expect(() => checkTrainingGroup(TP, 0, 0, 0, 0, 0)).not.toThrow();
            expect(() => checkTrainingGroup(TP, 1, 0, 0, 0, 0)).toThrow("group sum 1 exceeds available TP 0");
        });
    });
});