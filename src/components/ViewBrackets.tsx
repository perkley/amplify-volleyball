import React, { useEffect, useState } from 'react';
import '../brackets.css';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();
type Tournament = Schema['Tournament']['type'];

interface ViewbracketsProps {
  isAdmin: boolean;
}

// This is the match object
type MatchObj = {
  matchid: string;
  team1: string;
  team1id: string;
  team2id: string;
  team2: string;
  score1: string;
  score2: string;
  seed1: string;
  seed2: string;
  winner: number;
} | null;

type Round = MatchObj[];
type Bracket = Round[];

// We want to create a bracket with 8 teams, 4 matches the first round, 2 the next, 1 in the last.
const createBracket = (): Bracket => {
  return [
    Array(4).fill(null),
    Array(2).fill(null),
    Array(1).fill(null)
  ];
};

// Function to update a match in the bracket
const updateMatch = (bracket: Bracket, round: number, matchIndex: number, matchData: MatchObj): Bracket => {
  const newBracket = [...bracket];
  newBracket[round - 1][matchIndex] = matchData;
  return newBracket;
};

// Initialize the bracket
let bracket: Bracket = createBracket();

// Example: Populate some data
//bracket = updateMatch(bracket, 1, 0, { team1: "Show Muzzy", team2: "Rise", score1: "14", score2: "10", seed1: 1, seed2: 8, winner: 1 });
// bracket = updateMatch(bracket, 1, 1, { team1: "ZTV 18 Meyer", team2: "Bonneville", score1: "11", score2: "12", seed1: 4, seed2: 5, winner: 2 });
// bracket = updateMatch(bracket, 2, 0, { team1: "Show Muzzy", team2: "Bonneville", score1: "8", score2: "11", seed1: 1, seed2: 5, winner: 2 });

// This method creates the HTML code according to the bracket array
const renderBracket = (bracket: any[], isAdmin: boolean) => {
  return (
    <div className="theme theme-dark">
      <div className="bracket disable-image">
      {/* Loop over each round */}
      {bracket.map((round, roundIndex) => (
        <div key={roundIndex} className={`column ${roundIndex === 0 ? 'one' : roundIndex === 1 ? 'two' : 'three'}`}>
          {/* Loop over each match */}
          {round.map((match: MatchObj, matchIndex: number) => (
           
            <div key={matchIndex} className={`match winner-${match?.winner===1 ? 'top' : match?.winner===2 ? `bottom` : ''}`}>
              {renderBracketMatchHtml(match, 1, isAdmin)}
              {renderBracketMatchHtml(match, 2, isAdmin)}
            
              <div className="match-lines">
                    <div className="line one"></div>
                    <div className="line two"></div>
                  </div>
                  <div className="match-lines alt">
                    <div className="line one"></div>
                  </div>
            </div>
          ))}
        </div>
      ))}
      </div>
    </div>
  );
};

// This is the individual team html
/*
const renderBracketMatchHtml = (bracketMatch: MatchObj, team: number, isAdmin: boolean) => {
  return (
  <div className={`match-${(team===1) ? 'top' : 'bottom' } team`}>
    {isAdmin && (
      <span>+</span>
    )}
    <span className="image"></span>
    <span className="seed">{(team === 1) ? bracketMatch?.seed1 : bracketMatch?.seed2}</span>
    <span className="name">{(team === 1) ? bracketMatch?.team1 : bracketMatch?.team2}</span>
    <span className="score">{(team === 1) ? bracketMatch?.score1 : bracketMatch?.score2}</span>
  </div>
  )
}; */

const renderBracketMatchHtml = (bracketMatch: MatchObj, team: number, isAdmin: boolean) => {
  return (
    <div className={`match-${(team === 1) ? 'top' : 'bottom' } team`}>
      {isAdmin && (
    
          <span className='plus'>+</span>
        
      )}
      <span className="image"></span>
      <span className="seed">{(team === 1) ? bracketMatch?.seed1 : bracketMatch?.seed2}</span>
      <span className="name">{(team === 1) ? bracketMatch?.team1 : bracketMatch?.team2}</span>
      <span className="score">{(team === 1) ? bracketMatch?.score1 : bracketMatch?.score2}</span>
      {isAdmin && (  
          
          <span className='minus'> <a className='minus' href="#" onClick={(e) => { e.preventDefault(); deleteTeam(bracketMatch?.matchid, (team===1) ); }}> - </a></span>
        
      )}
    </div>
  );
};




  const deleteTeam = (matchId: string | null | undefined, isTopTeam:boolean) => {
    if (matchId) {
      if (isTopTeam){
        client.models.Match.update({ id:matchId, team1Id:null, team1Score:null }, { authMode: 'userPool' });

      }
     
      else
      {
      client.models.Match.update({ id:matchId, team2Id:null, team2Score:null }, { authMode: 'userPool' });
      }

    {/* client.models.Match.delete({ id }, { authMode: 'userPool' }); */}
  }}



const ViewBrackets: React.FC<ViewbracketsProps> = ({isAdmin}) => {
  const [tournament, setTournament] = useState<Tournament>();
  // const [matches, setMatches] = useState<Match[]>([]);
  const [bracket2, setBracket] = useState<Bracket>(createBracket());

  const setTournamentData = async (id: string) => { 
    console.log('setTournamentData')
    const tournamentDbData = await client.models.Tournament.get(
      { id: id },
      { selectionSet: ["id", "name",
         "matches.*",
         "matches.team1.*",
         "matches.team2.*",
         "matches.winningTeam.*",
         "matches.nextMatch.*"
        ] },

    );

    if (tournamentDbData.data && tournamentDbData.data.matches)
      {
        tournamentDbData.data.matches.forEach((match) => 
        {  
          //console.log('match', match);
          const formatScore = (score: number | null) => (score?.toString() === '0' ? '' : score?.toString() ?? '');

          // Now set the bracket array for this match
          bracket = updateMatch(bracket, match.round, match.matchNumber-1, { 
            matchid: match.id,
            team1: match.team1?.name, 
            team2: match.team2?.name,
            team1id: match.team1?.id,
            team2id: match.team2?.id, 
            score1: formatScore(match.team1Score), 
            score2: formatScore(match.team2Score), 
            seed1: formatScore(match.team1?.rank), 
            seed2: formatScore(match.team2?.rank), 
            winner: match.winningTeam ? (match.team1.id === match.winningTeam.id ? 1 : 2) : 0 });
        })
  
      }
      setBracket(bracket);
  }
  // This is where it loads the bracket data
  useEffect(() => {
    const fetchData = async () => {
      // Get the tournament
      const tournaments = await client.models.Tournament.list();
      const tournament = tournaments?.data[0];
      //console.log('tournaments', tournament);
      setTournament(tournament); // We just want the first one for now.
      
      // Get the tournament data and set the bracket array with the data.
      //const tournamentDbData = await fetchTournament(tournament.id);
      //console.log('tournamentData', tournamentDbData);

      setTournamentData(tournament.id);
      //console.log(bracket);

    };
    
    fetchData();
  }, []);

  
 




  return (

    <div>
        {tournament ? (<h1>{tournament.name}</h1>) : (<p>Loading tournament...</p>)}
     
        {/* This is the code to generate it from the database */}
        {renderBracket(bracket2, isAdmin)}


<h1>GOLD BRACKET CHAMPIONSHIP</h1>
{/* This is the original code below */}

        <div className="theme theme-dark">
  <div className="bracket disable-image">
    <div className="column one">

      <div className="match winner-top">
        <div className="match-top team">
          <span className="image"></span>
          <span className="seed">1</span>
          <span className="name">Show Muzzy</span>
          <span className="score">14</span>
        </div>
        <div className="match-bottom team">
          <span className="image"></span>
          <span className="seed">8</span>
          <span className="name">Rise</span>
          <span className="score">10</span>
        </div>
        <div className="match-lines">
          <div className="line one"></div>
          <div className="line two"></div>
        </div>
        <div className="match-lines alt">
          <div className="line one"></div>
        </div>
      </div>

      <div className="match winner-bottom">
        <div className="match-top team">
          <span className="image"></span>
          <span className="seed">4</span>
          <span className="name">ZTV 18 Meyer</span>
          <span className="score">11</span>
        </div>
        <div className="match-bottom team">
          <span className="image"></span>
          <span className="seed">5</span>
          <span className="name">Bonneville</span>
          <span className="score">12</span>
        </div>
        <div className="match-lines">
          <div className="line one"></div>
          <div className="line two"></div>
        </div>
        <div className="match-lines alt">
          <div className="line one"></div>
        </div>
      </div>

      <div className="match winner-top">
        <div className="match-top team">
          <span className="image"></span>
          <span className="seed">2</span>
          <span className="name">Elite Lynns</span>
          <span className="score">14</span>
        </div>
        <div className="match-bottom team">
          <span className="image"></span>
          <span className="seed">7</span>
          <span className="name">Siva</span>
          <span className="score">13</span>
        </div>
        <div className="match-lines">
          <div className="line one"></div>
          <div className="line two"></div>
        </div>
        <div className="match-lines alt">
          <div className="line one"></div>
        </div>
      </div>

      <div className="match winner-top">
        <div className="match-top team">
          <span className="image"></span>
          <span className="seed">3</span>
          <span className="name">Sun Summit</span>
          <span className="score">11</span>
        </div>
        <div className="match-bottom team">
          <span className="image"></span>
          <span className="seed">6</span>
          <span className="name">EIVC</span>
          <span className="score">9</span>
        </div>
        <div className="match-lines">
          <div className="line one"></div>
          <div className="line two"></div>
        </div>
        <div className="match-lines alt">
          <div className="line one"></div>
        </div>
      </div>

    </div>

    <div className="column two">

      <div className="match winner-bottom">
        <div className="match-top team">
          <span className="image"></span>
          <span className="seed">1</span>
          <span className="name">Show Muzzy</span>
          <span className="score">8</span>
        </div>
        <div className="match-bottom team">
          <span className="image"></span>
          <span className="seed">5</span>
          <span className="name">Bonneville</span>
          <span className="score">11</span>
        </div>
        <div className="match-lines">
          <div className="line one"></div>
          <div className="line two"></div>
        </div>
        <div className="match-lines alt">
          <div className="line one"></div>
        </div>
      </div>

      <div className="match winner-bottom">
        <div className="match-top team">
          <span className="image"></span>
          <span className="seed">2</span>
          <span className="name">Elite Lynns</span>
          <span className="score">15</span>
        </div>
        <div className="match-bottom team">
          <span className="image"></span>
          <span className="seed">3</span>
          <span className="name">Sun Summit</span>
          <span className="score">11</span>
        </div>
        <div className="match-lines">
          <div className="line one"></div>
          <div className="line two"></div>
        </div>
        <div className="match-lines alt">
          <div className="line one"></div>
        </div>
      </div>

    </div>
    <div className="column three">

      <div className="match winner-top">
        <div className="match-top team">
          <span className="image"></span>
          <span className="seed">5</span>
          <span className="name">Bonneville</span>
          <span className="score">14</span>
        </div>
        <div className="match-bottom team">
          <span className="image"></span>
          <span className="seed">3</span>
          <span className="name">Sun Summit</span>
          <span className="score">10</span>
        </div>
        <div className="match-lines">
          <div className="line one"></div>
          <div className="line two"></div>
        </div>
        <div className="match-lines alt">
          <div className="line one"></div>
        </div>
      </div>        
    </div>
  </div>
</div>

</div>
    );
};

export default ViewBrackets;