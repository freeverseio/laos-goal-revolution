
const PLAYERS_PER_TEAM_MAX = 25;
const IN_TRANSIT_SHIRTNUM = 26;

const getFreeShirtNumber = async ({pgClient, teamId}) => {
  var query = {
      text: `
          SELECT shirt_number FROM players                       
          WHERE team_id = $1
          AND voided = false;
      `,
      values: [teamId],
  };
  const sqlResult = await pgClient.query(query);

  if (sqlResult && sqlResult.rowCount > 0) {
    const shirtNumbers = sqlResult.rows.map(row => row.shirt_number);
    for (let i = PLAYERS_PER_TEAM_MAX - 1; i >= 0; i--) {
      if (!shirtNumbers.includes(i)) {
        return i;
      }
    }
  } else {
    console.info("Not possible to retrieve shirt numbers for teamId: ", teamId);
  }
  return IN_TRANSIT_SHIRTNUM;
};
const getTeamIdByPlayerId = async ({pgClient, playerId}) => {
  var query = {
      text: `
          SELECT team_id FROM players WHERE player_id = $1
      `,
      values: [playerId],
  };
  
  const sqlResult = await pgClient.query(query);
  if (sqlResult && sqlResult.rowCount === 1) {
      return sqlResult.rows[0].team_id;
  } else {
      console.warn("getTeamIdByPlayerId, team not found: ", sqlResult);
      return null;
  }
}

const completePlayerTransitWrapper = propName => {
  return async (resolve, source, args, context, resolveInfo) => {
    if(!args || !args.input || !args.input.playerId){
      throw new Error("Invalid input");
    }
    const playerId = args.input.playerId;
    const { pgClient } = context;
    //check if this playerId exists and retrieve its teamId
    const teamId = await getTeamIdByPlayerId({pgClient, playerId});
    if (!teamId) {
        console.warn("Error in completePlayerTransit: TeamId doesn't exist for playerId ", playerId);
        throw new Error("Player doesn't exist");
    }

    const newShirtNumber = await getFreeShirtNumber({pgClient, teamId});
    if (newShirtNumber === IN_TRANSIT_SHIRTNUM) {
      console.info("Cancelled completePlayerTransit: No free shirt number in teamId ", teamId);
      return playerId;
    }

    // update player with new shirtNumber
    var query = {
        text: `
            UPDATE players 
            SET shirt_number = $1              
            WHERE player_id = $2 AND team_id = $3
            RETURNING shirt_number;
        `,
        values: [newShirtNumber, playerId, teamId],
    };
    
    const sqlResult = await pgClient.query(query);

    if (sqlResult && sqlResult.rowCount === 1) {
      console.log("Player updated: ", sqlResult.rows[0].shirt_number);
    } else {
      console.error("Error in completePlayerTransit: ", sqlResult);
    }

    return playerId;
  };
};

module.exports = {
    getFreeShirtNumber,
    getTeamIdByPlayerId,
    completePlayerTransitWrapper
}