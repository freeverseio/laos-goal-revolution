-- reset timezones
INSERT INTO timezones (timezone_idx) VALUES (0);
INSERT INTO timezones (timezone_idx) VALUES (1);
INSERT INTO timezones (timezone_idx) VALUES (2);
INSERT INTO timezones (timezone_idx) VALUES (3);
INSERT INTO timezones (timezone_idx) VALUES (4);
INSERT INTO timezones (timezone_idx) VALUES (5);
INSERT INTO timezones (timezone_idx) VALUES (6);
INSERT INTO timezones (timezone_idx) VALUES (7);
INSERT INTO timezones (timezone_idx) VALUES (8);
INSERT INTO timezones (timezone_idx) VALUES (9);
INSERT INTO timezones (timezone_idx) VALUES (10);
INSERT INTO timezones (timezone_idx) VALUES (11);
INSERT INTO timezones (timezone_idx) VALUES (12);
INSERT INTO timezones (timezone_idx) VALUES (13);
INSERT INTO timezones (timezone_idx) VALUES (14);
INSERT INTO timezones (timezone_idx) VALUES (15);
INSERT INTO timezones (timezone_idx) VALUES (16);
INSERT INTO timezones (timezone_idx) VALUES (17);
INSERT INTO timezones (timezone_idx) VALUES (18);
INSERT INTO timezones (timezone_idx) VALUES (19);
INSERT INTO timezones (timezone_idx) VALUES (20);
INSERT INTO timezones (timezone_idx) VALUES (21);
INSERT INTO timezones (timezone_idx) VALUES (22);
INSERT INTO timezones (timezone_idx) VALUES (23);
INSERT INTO timezones (timezone_idx) VALUES (24);

-- only use it to wipe the db 
delete from matches_histories;
delete from teams_histories;
delete from tactics_histories;
delete from players_histories;
delete from match_events;
delete from players;
delete from matches;
delete from tactics;
delete from trainings;
delete from team_props;
delete from teams;
Delete from leagues;
delete from verses where verse_number > 1;
delete from verses where verse_number = 1;
INSERT INTO public.verses (verse_number, verse_timestamp, timezone_idx, root) 
VALUES 
    (1, 1730064600, 21, '0');
    select * from matches m where m.state != 'end';