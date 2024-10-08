const numberOfTeams = 32;
const numberOfPlayers = 18;

for (let i = 26; i <= 32; i++) {
  for (let j = 1; j <= numberOfPlayers; j++) {
  console.log(`INSERT INTO public.players ("name",player_id,team_id,defence,speed,pass,shoot,endurance,shirt_number,preferred_position,potential,day_of_birth,encoded_skills,encoded_state,red_card,injury_matches_left,tiredness,country_of_birth,race,yellow_card_1st_half,voided) VALUES
	 ('Team${i} Player${j}','${i}000${j}','${i}',50,50,50,50,50,${j},'M CR',5,10960,'766247770433488889593365984960121740280117916687746990130','0x123',false,0,0,'ES','Spanish',false,false);`)
  }
}