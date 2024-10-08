const numberOfTeams = 32;

for (let i = 1; i <= numberOfTeams; i++) {
  console.log(`INSERT INTO public.tactics (team_id,tactic_id,shirt_0,shirt_1,shirt_2,shirt_3,shirt_4,shirt_5,shirt_6,shirt_7,shirt_8,shirt_9,shirt_10,substitution_0_shirt,substitution_0_target,substitution_0_minute,substitution_1_shirt,substitution_1_target,substitution_1_minute,substitution_2_shirt,substitution_2_target,substitution_2_minute,extra_attack_1,extra_attack_2,extra_attack_3,extra_attack_4,extra_attack_5,extra_attack_6,extra_attack_7,extra_attack_8,extra_attack_9,extra_attack_10) VALUES
	 ('${i}',${i},10,2,3,5,9,8,4,1,11,6,7,25,11,0,25,11,0,25,11,0,false,false,false,false,false,false,false,false,false,false);
`)
}