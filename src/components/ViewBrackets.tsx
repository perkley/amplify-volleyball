import React, { useEffect, useState } from 'react';
import '../brackets.css';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();
type Tournament = Schema['Tournament']['type'];
type Match = Schema['Match']['type'];

// This is the match object
type MatchObj = {
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  seed1: number;
  seed2: number;
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
bracket = updateMatch(bracket, 1, 0, { team1: "Show Muzzy", team2: "Rise", score1: "14", score2: "10", seed1: 1, seed2: 8, winner: 1 });
bracket = updateMatch(bracket, 1, 1, { team1: "ZTV 18 Meyer", team2: "Bonneville", score1: "11", score2: "12", seed1: 4, seed2: 5, winner: 2 });
bracket = updateMatch(bracket, 2, 0, { team1: "Show Muzzy", team2: "Bonneville", score1: "8", score2: "11", seed1: 1, seed2: 5, winner: 2 });

const renderBracket = (bracket: any[]) => {
  return (
    <div className="theme theme-dark">
      <div className="bracket disable-image">
      {/* Loop over each round */}
      {bracket.map((round, roundIndex) => (
        <div className={`column ${roundIndex === 0 ? 'one' : roundIndex === 1 ? 'two' : 'three'}`}>
          {/* Loop over each match */}
          {round.map((match: MatchObj) => (
           
            <div className={`match winner-${match?.winner===1 ? 'top' : 'bottom'}`}>
              {renderBracketMatchHtml(match, 1)}
              {renderBracketMatchHtml(match, 2)}
            
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

const renderBracketMatchHtml = (bracketMatch: MatchObj, team: number) => {
  return (
  <div className={`match-${(team===1) ? 'top' : 'bottom' } team`}>
    <span className="image"></span>
    <span className="seed">{(team === 1) ? bracketMatch?.seed1 : bracketMatch?.seed2}</span>
    <span className="name">{(team === 1) ? bracketMatch?.team1 : bracketMatch?.team2}</span>
    <span className="score">{(team === 1) ? bracketMatch?.score1 : bracketMatch?.score2}</span>
  </div>
  )
};

const ViewBrackets: React.FC = () => {
  const [tournament, setTournament] = useState<Tournament>();
  const [matches, setMatches] = useState<Match[]>([]);


  // This is where it loads the bracket data
  useEffect(() => {
    const fetchData = async () => {
      // Get the tournament
      const tournaments = await client.models.Tournament.list();
      const tournament = tournaments?.data[0];
      console.log('tournaments', tournament);
      setTournament(tournament); // We just want the first one for now.
      
      // Get the matches
      // const { data: r1m1 } = await client.models.Match.get({ tournamentId: tournament.id });
  
      const { data: matches, errors } = await client.models.Match.listMatchByTournamentId({
        tournamentId: tournament.id,
      });
      setMatches(matches)
      console.log('Matches', matches, errors);
      bracket = updateMatch(bracket, 1, 0, { team1: "asdf Muzzy", team2: "Rise", score1: "14", score2: "10", seed1: 1, seed2: 8, winner: 1 });
    };
    
    fetchData();
  }, []);

  

  return (

    <div>
       
        {tournament ? (<h1>{tournament.name}</h1>) : (<p>Loading tournament...</p>)}
     
        {/* <h1>GOLD BRACKET CHAMPIONSHIP</h1> */}
        {/* This is the code to generate it from the database */}
        {renderBracket(bracket)}

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