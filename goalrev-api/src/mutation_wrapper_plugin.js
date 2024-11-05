const { makeWrapResolversPlugin } = require("graphile-utils");
const { checkTrainingGroup, checkTrainingSpecialPlayer } = require('./training');
const { checkTactics2ndHalf, checkTacticsGeneric } = require("./tactics");

const updateTrainingByTeamIdWrapper = propName => {
    return async (resolve, source, args, context, resolveInfo) => {
        const { teamId, trainingPatch } = args.input;
        const { pgClient } = context;

        const query = {
            text: 'SELECT training_points FROM teams WHERE team_id = $1',
            values: [teamId],
        };

        const result = await pgClient.query(query);
        if (result.rowCount === 0) {
            throw "unexistent team";
        }

        const allowedTP = result.rows[0].training_points;

        checkTrainingGroup(allowedTP, trainingPatch.attackersShoot, trainingPatch.attackersSpeed, trainingPatch.attackersPass, trainingPatch.attackersDefence, trainingPatch.attackersEndurance);
        checkTrainingGroup(allowedTP, trainingPatch.defendersShoot, trainingPatch.defendersSpeed, trainingPatch.defendersPass, trainingPatch.defendersDefence, trainingPatch.defendersEndurance);
        checkTrainingGroup(allowedTP, trainingPatch.goalkeepersShoot, trainingPatch.goalkeepersSpeed, trainingPatch.goalkeepersPass, trainingPatch.goalkeepersDefence, trainingPatch.goalkeepersEndurance);
        checkTrainingGroup(allowedTP, trainingPatch.midfieldersShoot, trainingPatch.midfieldersSpeed, trainingPatch.midfieldersPass, trainingPatch.midfieldersDefence, trainingPatch.midfieldersEndurance);

        checkTrainingSpecialPlayer(allowedTP, trainingPatch.specialPlayerShoot, trainingPatch.specialPlayerSpeed, trainingPatch.specialPlayerPass, trainingPatch.specialPlayerDefence, trainingPatch.specialPlayerEndurance);

        return resolve();
    };
};

const updateTacticByTeamIdWrapper = propName => {
    return async (resolve, source, args, context, resolveInfo) => {
        const { teamId, tacticPatch } = args.input;
        // First: do a formal check on the inputs, irrespective of which half we are in:
        checkTacticsGeneric(tacticPatch);

        // Next, find out if we are in half time, and if so, do specific (more complex logic) tests.
        // First, query for matches at half time for this teamId (there can be none or one).
        // In the same query, get all the players of that teamId.
        const { pgClient } = context;
        var query = {
            text: 'SELECT encoded_skills, shirt_number, red_card, injury_matches_left, timezone_idx, country_idx, league_idx, match_day_idx, match_idx FROM players JOIN matches ON (players.team_Id = matches.home_team_id OR players.team_Id = matches.visitor_team_id)  WHERE (team_id = $1 AND state = $2);',
            values: [teamId, 'half'],
        };
        const resultQ1 = await pgClient.query(query);

        const is1stHalf = (resultQ1.rowCount === 0);
        if (is1stHalf) { return resolve(); }

        // Second, query for match events to see count redCards in 1stHalf:
        data = resultQ1.rows;
        query = {
            text: 'SELECT COUNT(*) FROM match_events WHERE (team_id = $1 AND type = $2 AND timezone_idx = $3 AND country_idx = $4 AND league_idx = $5 AND match_day_idx = $6 AND match_idx = $7);',
            values: [teamId, 'red_card', data[0].timezone_idx, data[0].country_idx, data[0].league_idx, data[0].match_day_idx, data[0].match_idx],
        };

        const resultQ2 = await pgClient.query(query);
        if (resultQ2.rowCount === 0) {
            // if the match is in half time, there MUST be some event from the 1st half.
            throw "unexistent matchevents";
        }
        const nRedCards1stHalf = resultQ2.rows[0].count;

        // Finally, do the checks:
        checkTactics2ndHalf(nRedCards1stHalf, data, tacticPatch);
        return resolve();
    };
};

const playerHistoryGraphByPlayerIdResolver = propName => {
    return async (resolve, source, args, context, resolveInfo) => {
        const { pgClient } = context;
        var query = {
            text: 'SELECT encoded_skills FROM players_histories WHERE player_id = $1 ORDER BY block_number DESC',
            values: [source.playerId],
        };

        const resulsqlResult = await pgClient.query(query);
        let playerHistoryGraph = [];
        for (let i = 0; i < resulsqlResult.rows.length; i++) {
            playerHistoryGraph.push({ encodedSkills: resulsqlResult.rows[i].encoded_skills });
        }
        return { nodes: playerHistoryGraph };
    };;
};

const transferFirstBotToAddrWrapper = propName => {
  return async (resolve, source, args, context, resolveInfo) => {
      const { pgClient } = context;
      var query = {
          text: `
              UPDATE teams 
              SET "owner" = $1 ,
              "mint_status" = 'pending'
            
              WHERE team_id = (
                  SELECT team_id 
                  FROM teams t 
                  WHERE "owner" = '0x0000000000000000000000000000000000000000' 
                  AND timezone_idx = $2 
                  AND country_idx = $3 
                  ORDER BY CAST(ranking_points AS INTEGER) DESC 
                  LIMIT 1
              )
              RETURNING team_id;
          `,
          values: [args.address, args.timezone, args.countryIdxInTimezone],
      };
      
      const sqlResult = await pgClient.query(query);

      if (sqlResult && sqlResult.rowCount === 1) {
        console.log("Team updated: ", sqlResult.rows[0].team_id);
      } else {
        console.error("Error in transferFirstBotToAddr: ", sqlResult);
      }

      return true;
  };
};

const setMessageWrapper = propName => {
return async (resolve, source, args, context, resolveInfo) => {    
    const { input } = args;
    const { id, destinatary, category, auctionId, title, text, customImageUrl, metadata } = input;
    try {
        if (id) {
            return Error("Can't accept id in set message");
        }
        const { pgClient } = context;
        const idFromDb = await insertNotificationMessage({pgClient, 
            destinatary,
            category,
            auctionId,
            title,
            text,
            customImageUrl,
            metadata,
        });
    
        return idFromDb;
    } catch (e) {
        return e;
    }
    };
};

const insertNotificationMessage = async ({ pgClient, destinatary, category, auctionId, title, text, customImageUrl, metadata }) => {
    const values = [destinatary, category, auctionId, title, text, customImageUrl, metadata];
    try {
        const insertMessageQuery = {
            text: `
                INSERT INTO 
                    inbox(
                    destinatary,
                    category,
                    auction_id,
                    title,
                    text_message,
                    custom_image_url,
                    metadata,
                    is_read
                    )
                VALUES ($1, $2, $3, $4, $5, $6, $7, false)
                RETURNING id
                `,
        };
        const { rows } = await pgClient.query(insertMessageQuery, values);
        const { id } = rows[0];
        return id;
    } catch (e) {
        throw e;
    }
};

const setMessageReadWrapper = propName => {
    return async (resolve, source, args, context, resolveInfo) => {    
        const { id } = args;
        try {
            const { pgClient } = context;
            const updateMessageReadQuery = {
                text: `
                  UPDATE
                    inbox
                  SET
                    is_read=true
                  WHERE
                    id=$1
                  `,
              };
            const values = [id];
            const {rowCount} = await pgClient.query(updateMessageReadQuery, values);
            if (rowCount === 0) {
                console.warn("Message not found. MessageId: ", id);
                return false;
            }
            return true
        } catch (e) {
            return e;
        }
    };
};

module.exports = makeWrapResolversPlugin({
    Mutation: {
        updateTrainingByTeamId: updateTrainingByTeamIdWrapper(),
        updateTacticByTeamId: updateTacticByTeamIdWrapper(),
        transferFirstBotToAddr: transferFirstBotToAddrWrapper(),
        setMessage: setMessageWrapper(),
        setMessageRead: setMessageReadWrapper(),
    },
    Player: {
        playerHistoryGraphByPlayerId: playerHistoryGraphByPlayerIdResolver(),
    }
});