const checkTrainingGroup = (TP, shoot, speed, pass, defence, endurance) => {
    if (isNaN(TP)
        || isNaN(shoot)
        || isNaN(speed)
        || isNaN(pass)
        || isNaN(defence)
        || isNaN(endurance)) throw "invalid params";

    const sum = shoot + speed + pass + defence + endurance;
    if (sum > TP) throw "group sum " + sum + " exceeds available TP " + TP;

    // the RightHandSide should be RHS = 6*TP or, if TP==1, RHS = 10, so that max per skill is at most 1.
    RHS = (TP == 1) ? 10 : 6 * TP;

    if (10 * shoot > RHS) throw "shoot exceeds 60% of TP " + TP;
    if (10 * speed > RHS) throw "speed exceeds 60% of TP " + TP;
    if (10 * pass > RHS) throw "pass exceeds 60% of TP " + TP;
    if (10 * defence > RHS) throw "defence exceeds 60% of TP " + TP;
    if (10 * endurance > RHS) throw "endurance exceeds 60% of TP " + TP;
};

const checkTrainingSpecialPlayer = (TP, shoot, speed, pass, defence, endurance) => {
    const specialPlayerTP = Math.floor(TP * 11 / 10);
    checkTrainingGroup(specialPlayerTP, shoot, speed, pass, defence, endurance);
};

module.exports = {
    checkTrainingGroup,
    checkTrainingSpecialPlayer,
};

