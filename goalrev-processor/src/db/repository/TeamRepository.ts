import { AppDataSource } from "../AppDataSource";
import { EntityManager, In } from "typeorm";
import { MintStatus, Player, Team, TeamPartialUpdateMint } from "../entity";
import { TeamId } from "../../types/leaguegroup";

export class TeamRepository {

  async findById(teamId: string): Promise<Team | null> {
    const teamRepository = AppDataSource.getRepository(Team);
    return await teamRepository.findOneBy({ team_id: teamId });
  }

  async save(team: Team): Promise<Team> {
    const entityManager = AppDataSource.manager;
    const teamRepository = entityManager.getRepository(Team);
    return teamRepository.save(team);
  }

  async setMintStatus(teamsIds: string[], mintStatus: MintStatus): Promise<void> {
    const entityManager = AppDataSource.manager;
    const teamRepository = entityManager.getRepository(Team);
    await teamRepository.update(teamsIds, { mint_status: mintStatus, mint_updated_at: new Date() });
  }

  // async bulkUpdate(teams: TeamPartialUpdate[], transactionalEntityManager: EntityManager): Promise<void> {
  //   const teamRepository = transactionalEntityManager.getRepository(Team);
  //   await teamRepository.save(teams);
  // }

  async bulkUpdateRankingPoints(
    partialRankingPoints: { team_id: string; ranking_points: string; ranking_points_real: string; prev_perf_points: string }[],
    transactionalEntityManager: EntityManager
  ): Promise<void> {
    if (partialRankingPoints.length === 0) return;
  
    const teamRepository = transactionalEntityManager.getRepository(Team);
    
    // Create the CASE expressions for each column
    const rankingPointsCases = partialRankingPoints
      .map(rp => `WHEN team_id = '${rp.team_id}' THEN '${rp.ranking_points}'`)
      .join(' ');
  
    const rankingPointsRealCases = partialRankingPoints
      .map(rp => `WHEN team_id = '${rp.team_id}' THEN '${rp.ranking_points_real}'`)
      .join(' ');
  
    const prevPerfPointsCases = partialRankingPoints
      .map(rp => `WHEN team_id = '${rp.team_id}' THEN '${rp.prev_perf_points}'`)
      .join(' ');
  
    // Get all team IDs
    const teamIds = partialRankingPoints.map(rp => rp.team_id);
  
    // Create and execute a single update query
    await teamRepository
      .createQueryBuilder()
      .update(Team)
      .set({
        ranking_points: () => `CASE ${rankingPointsCases} ELSE ranking_points END`,
        ranking_points_real: () => `CASE ${rankingPointsRealCases} ELSE ranking_points_real END`,
        prev_perf_points: () => `CASE ${prevPerfPointsCases} ELSE prev_perf_points END`
      })
      .where("team_id IN (:...teamIds)", { teamIds })
      .execute();
  }

  async bulkUpdateMint(
    teams: TeamPartialUpdateMint[],
    transactionalEntityManager: EntityManager
  ): Promise<void> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
    const playerRepository = transactionalEntityManager.getRepository(Player);
  
    // Create the CASE expressions for the team updates
    const teamUpdateCases = teams
      .map((team) => `WHEN team_id = '${team.team_id}' THEN '${team.mint_status}'`)
      .join(' ');
  
    const teamUpdateDateCases = teams
      .map((team) => `WHEN team_id = '${team.team_id}' THEN '${team.mint_updated_at!.toISOString()}'`)
      .join(' ');
  
    // Get all team IDs
    const teamIds = teams.map((team) => team.team_id);
  
    // Create and execute a single update query for the teams
    await teamRepository
      .createQueryBuilder()
      .update(Team)
      .set({
        mint_status: () => `CASE ${teamUpdateCases} ELSE mint_status END`,
        mint_updated_at: () => `CASE ${teamUpdateDateCases} ELSE mint_updated_at END`,
      })
      .where("team_id IN (:...teamIds)", { teamIds })
      .execute();
  
    // Create the CASE expressions for the player updates
    const playerUpdateCases = teams
      .filter((team) => team.players)
      .flatMap((team) =>
        team.players!.map((player) => `WHEN player_id = '${player.player_id}' THEN '${player.token_id}'`)
      )
      .join(' ');
  
    // Get all player IDs
    const playerIds = teams.flatMap((team) => team.players?.map((player) => player.player_id) || []);
  
    // Create and execute a single update query for the players
    await playerRepository
      .createQueryBuilder()
      .update(Player)
      .set({
        token_id: () => `CASE ${playerUpdateCases} ELSE token_id END`,
      })
      .where("player_id IN (:...playerIds)", { playerIds })
      .execute();
  }

  // async bulkUpdateMint(
  //   teams: TeamPartialUpdateMint[],
  //   transactionalEntityManager: EntityManager
  // ): Promise<void> {
  //   const teamRepository = transactionalEntityManager.getRepository(Team);
  //   const playerRepository = transactionalEntityManager.getRepository(Player);
  
  //   // Loop over each team in the input array
  //   for (const team of teams) {
  //     // Update the team record with only the specified fields
  //     await teamRepository
  //       .createQueryBuilder()
  //       .update(Team)
  //       .set({
  //         mint_status: team.mint_status,
  //         mint_updated_at: team.mint_updated_at,
  //       })
  //       .where("team_id = :teamId", { teamId: team.team_id })
  //       .execute();
  
  //     // If the team has related players to update
  //     if (team.players) {
  //       for (const player of team.players) {
  //         await playerRepository
  //           .createQueryBuilder()
  //           .update(Player)
  //           .set({
  //             token_id: player.token_id,
  //           })
  //           .where("player_id = :playerId", { playerId: player.player_id })
  //           .execute();
  //       }
  //     }
  //   }
  // }
  

  async bulkCreate(teams: Team[], transactionalEntityManager: EntityManager): Promise<void> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
    await teamRepository.save(teams);
  }

  async findPendingTeams(limit: number = 5): Promise<Team[]> {
    const timeLimitAgo = new Date(Date.now() - 30 * 60 * 1000);
  
    return await AppDataSource.transaction(async (transactionalEntityManager: EntityManager) => {
      const teamRepository = transactionalEntityManager.getRepository(Team);
  
      // Step 1: Atomically update teams and retrieve updated rows
      const updatedTeams = await teamRepository.query(
        `
        WITH updated AS (
          SELECT team_id
          FROM teams
          WHERE (mint_status IN ($1) OR (mint_status = $2 AND mint_updated_at < $3))
          ORDER BY mint_updated_at ASC
          LIMIT $4
        )
        UPDATE teams
        SET mint_status = $5,
            mint_updated_at = $6
        FROM updated
        WHERE teams.team_id = updated.team_id
        RETURNING teams.*
        `,
        [
          MintStatus.PENDING,
          MintStatus.MINTING,
          timeLimitAgo,
          limit,
          MintStatus.MINTING,
          new Date(Date.now())
        ],
      );
  
      if (updatedTeams.length === 0 || updatedTeams[0].length === 0) {
        return [];
      }
  
      const teamIds = updatedTeams[0].map((team: any) => team.team_id);
  
      // Step 2: Fetch teams with their relations
      const teamsWithRelations = await teamRepository.find({
        where: { team_id: In(teamIds) },
        relations: ["players"],
      });
  
      // Step 3: Update in-memory team objects to reflect new status
      const now = new Date();
      teamsWithRelations.forEach((team) => {
        team.mint_status = MintStatus.MINTING;
        team.mint_updated_at = now;
      });
  
      return teamsWithRelations;
    });
  }

  async findFailedTeams(limit: number = 5): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    return await teamRepository.find({ where: { mint_status: MintStatus.FAILED }, relations: ["players"], take: limit });
  }

  async findTeamsWithPlayersByTimezone(timezoneIdx: number): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    const teams = await teamRepository.find({
      where: { timezone_idx: timezoneIdx },
      relations: ["players"]
    });
    return teams;
  }

  async findTeamsByCountryAndTimezone(countryIdx: number, timezoneIdx: number): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    const teams = await teamRepository
      .createQueryBuilder("team")
      .leftJoinAndSelect("team.country", "country")
      .where("country.country_idx = :countryIdx AND team.timezone_idx = :timezoneIdx", {
        countryIdx: countryIdx,
        timezoneIdx: timezoneIdx,
      })
      .orderBy("CAST(team.ranking_points_real AS BIGINT)", "DESC")
      .getMany();
    return teams;
  }

  async findTeamsByTimezoneCountryAndLeague(timezoneIdx: number, countryIdx: number, leagueIdx: number): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    const teams = await teamRepository
      .createQueryBuilder("team")
      .where("team.timezone_idx = :timezoneIdx AND team.country_idx = :countryIdx AND team.league_idx = :leagueIdx", {
        timezoneIdx: timezoneIdx,
        countryIdx: countryIdx,
        leagueIdx: leagueIdx,
      })
      .orderBy("team.team_idx_in_league", "ASC")
      .getMany();
    return teams;
  }

  async findCompleteTeamByTeamId(teamId: string): Promise<Team | null> {
    const teamRepository = AppDataSource.getRepository(Team);
    // find with players
    return await teamRepository.findOne({ where: { team_id: teamId }, relations: ["players"] });
  }

  async findByOwner(owner: string): Promise<Team | null> {
    const teamRepository = AppDataSource.getRepository(Team);
    return await teamRepository.findOneBy({ owner });
  }

  async findByOwners(owners: string[]): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);
    const queryBuilder = teamRepository.createQueryBuilder("team");

    // Add multiple OR conditions for each owner, case-insensitive
    if (owners.length > 0) {
      queryBuilder.where("team.owner ILIKE :owner0", { owner0: `%${owners[0]}%` });

      for (let i = 1; i < owners.length; i++) {
        queryBuilder.orWhere(`team.owner ILIKE :owner${i}`, { [`owner${i}`]: `%${owners[i]}%` });
      }
    }

    return await queryBuilder.getMany();
  }

  async updateLeagueIdx(teamId: string, leagueIdx: number, transactionalEntityManager: EntityManager): Promise<void> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
    await teamRepository.update(teamId, { league_idx: leagueIdx });
  }

  async updateLeagueIdxInBulk(teams: TeamId[], leagueIdx: number, transactionalEntityManager: EntityManager): Promise<void> {
    const teamRepository = transactionalEntityManager.getRepository(Team);

    const updatePromises = teams.map((teamId, index) => {
      const teamIdxInLeague = index % 8; // Index between 0 and 7
      return teamRepository.createQueryBuilder()
        .update(Team)
        .set({ league_idx: leagueIdx, team_idx_in_league: teamIdxInLeague })
        .where("team_id = :teamId", { teamId })
        .execute();
    });
    await Promise.all(updatePromises);
  }

  async createTeam(team: Team, transactionalEntityManager: EntityManager): Promise<Team> {
    const teamRepository = transactionalEntityManager.getRepository(Team);
    return teamRepository.save(team);
  }

  async countTeamsByTimezone(timezoneIdx: number, transactionalEntityManager: EntityManager): Promise<number> {
    const repository = transactionalEntityManager.getRepository(Team);
    return await repository.count({ where: { timezone_idx: timezoneIdx } });
  }

  async getShirtNumbers(teamId: string): Promise<number[]> {
    const playerRepository = AppDataSource.getRepository(Player);
    const shirtNumbers = await playerRepository.createQueryBuilder("player")
      .select("player.shirt_number", "shirt_number")
      .where("player.team_id = :teamId AND player.voided = false", { teamId })
      .getRawMany();

    return shirtNumbers.map(row => row.shirt_number);
  }


  async findByIds(teamIds: string[]): Promise<Team[]> {
    const teamRepository = AppDataSource.getRepository(Team);

    const teams = await teamRepository.find({
      where: {
        team_id: In(teamIds),
      },      
    });

    return teams;
  }

}