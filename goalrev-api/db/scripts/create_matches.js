/**
 * npm init -y 
 * npm i roundrobin
 * node create_matches.js
 */
var robin = require('roundrobin')

// for team ids 1-8 create a league where each team plays each other once
// 7 match days, 12 hours apart
// 4 matches per day
// then duplicate this array, reversing the team ids, for away  matches
// start epoch: 1727740800
const createLeagueMatches = async () => {
    //use robin package to schedule 1 match per team
    var homeMatches = robin(8)
    // duplicate and reverse for away matches
    // take advantage of iteration to 0-index teamIds
    var awayMatches = []
    for (var i = 0; i < homeMatches.length; i++) {
        var tmp = [] //temp array to store
        for (var j = 0; j < homeMatches[i].length; j++) {
            // 0-index teamIds
            homeMatches[i][j][0]--
            homeMatches[i][j][1]--
            //reverse teamIds for away match
            tmp.push([...homeMatches[i][j]].reverse())
        }
        awayMatches.push(tmp)
    }

    const matches = homeMatches.concat(awayMatches)
    console.log(matches)

    var matchIdx = 0
    var timezoneIdx = 10
    var countryIdx = 0
    var match_state = "begin"
    var leagueStartEpoch = 1727740800

    // z < 1 to create 1 league,  z < 2 for 2 leagues...
    for (z = 0; z < 1; z++) {
        var leagueIdx = z    
        //14 rounds
        for (var i = 0; i < 14; i++) {
            var startEpoch = leagueStartEpoch + 43200 * i
            var matchDayIdx = i + 1 // 1..14
            
            // 4 matches per day
            for (var j = 0; j < 4; j++) {
                var cm = matches[i][j]
                var homeTeamId = (cm[0] + (1 + leagueIdx * 8)).toString()
                var visitorTeamId = (cm[1] + (1 + leagueIdx * 8)).toString()
                var matchIdx = j // 0..3
                

                // const result = await db.pool.query(`
                //     INSERT INTO matches(timezone_idx, country_idx, league_idx, match_day_idx, match_idx, home_team_id, visitor_team_id, state, start_epoch)
                //     VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
                //     ;`,
                //     [
                //         timezoneIdx,
                //         countryIdx,
                //         leagueIdx,
                //         matchDayIdx,
                //         matchIdx,
                //         homeTeamId,
                //         visitorTeamId,
                //         match_state,
                //         startEpoch
                //     ]
                // )
                console.log("INSERT INTO matches(timezone_idx, country_idx, league_idx, match_day_idx, match_idx, home_team_id, visitor_team_id, state, start_epoch) VALUES(" + timezoneIdx + ", " + countryIdx + ", " + leagueIdx + ", " + matchDayIdx + ", " + matchIdx + ", " + homeTeamId + ", " + visitorTeamId + ", '" + match_state + "', " + startEpoch + ");");
            }
        }
    }
}

createLeagueMatches();