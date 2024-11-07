const updateTeamNameResolver = async (context, { teamId, name, signature }) => {
  try {        
    const { pgClient } = context;

    const result = await updateTeamName(pgClient, {
      teamId,
      teamName: name,
    });
    return { result };
  } catch (e) {
    return e;
  }
};

const updateTeamNameQuery = {
  text: `
    INSERT INTO 
        team_props(
            team_id,
            team_name,
            team_manager_name
        )
    VALUES ($1, $2, '')
    ON CONFLICT (team_id) DO UPDATE
    SET
        team_name = $2
    `,
};

const updateTeamNameTeamsQuery = {
  text: `
    UPDATE 
      teams
    SET
      name = $2
    WHERE 
      team_id = $1
    `,
};

const updateTeamName = async (pgClient,{ teamId, teamName }) => {
    try {
    const values = [teamId, teamName];    
    await pgClient.query(updateTeamNameQuery, values);
    return await pgClient.query(updateTeamNameTeamsQuery, values);

  } catch (e) {
    console.error("Error in updateTeamName",e);
    throw e;
  }
};

module.exports = {
  updateTeamNameResolver
};