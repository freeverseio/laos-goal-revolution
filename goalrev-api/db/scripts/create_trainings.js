const numberOfTeams = 32;

for (let i = 1; i <= numberOfTeams; i++) {
  console.log(`INSERT INTO public.trainings (team_id,special_player_shirt,goalkeepers_defence,goalkeepers_speed,goalkeepers_pass,goalkeepers_shoot,goalkeepers_endurance,defenders_defence,defenders_speed,defenders_pass,defenders_shoot,defenders_endurance,midfielders_defence,midfielders_speed,midfielders_pass,midfielders_shoot,midfielders_endurance,attackers_defence,attackers_speed,attackers_pass,attackers_shoot,attackers_endurance,special_player_defence,special_player_speed,special_player_pass,special_player_shoot,special_player_endurance) VALUES
	 ('${i}',1,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10,10);`)
  }
