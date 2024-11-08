const updateTeamManagerNameResolver = async (context, { teamId, name, signature }) => {
  try {        
    const { pgClient } = context;

    const result = await updateTeamManagerName(pgClient, {
      teamId,
      teamManagerName: name,
    });
    return { result };
  } catch (e) {
    return e;
  }
};

const updateTeamManagerNameQuery = {
  text: `
    INSERT INTO 
        team_props(
            team_id,
            team_name,
            team_manager_name
        )
    VALUES ($1, '', $2)
    ON CONFLICT (team_id) DO UPDATE
    SET
        team_manager_name = $2
    `,
};

const updateTeamManagerNameTeamsQuery = {
  text: `
    UPDATE 
      teams
    SET
      manager_name = $2
    WHERE 
      team_id = $1
    `,
};

const updateTeamManagerName = async (pgClient, { teamId, teamManagerName }) => {
    try {
    const values = [teamId, teamManagerName];
    await pgClient.query(updateTeamManagerNameQuery, values);
    return await pgClient.query(updateTeamManagerNameTeamsQuery, values);

  } catch (e) {
    throw e;
  }
};

module.exports = {
  updateTeamManagerNameResolver
};
