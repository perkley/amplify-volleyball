import React, { useEffect, useState } from 'react';
import '../brackets.css';
import { generateClient } from 'aws-amplify/api';
import type { Schema } from "../../amplify/data/resource";
import TeamSelectionPopup from './TeamSelectionPopup';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import EditableScore from './EditableScore';

const client = generateClient<Schema>();
type Tournament = Schema['Tournament']['type'];
type Team = Schema['Team']['type'];

interface ViewbracketsProps {
  isAdmin: boolean;
}

interface ConfirmationDialogState {
  isOpen: boolean;
  matchId: string | null | undefined;
  isTopTeam: boolean;
  title: string;
  teamName: string;
  message: string;
  confirmText: string;
  cancelText: string;
}

// This is the match object
type MatchObj = {
  matchid: string;
  team1: string | null;
  team1id: string | null;
  team2id: string | null;
  team2: string | null;
  score1: string;
  score2: string;
  seed1: string;
  seed2: string;
  winner: number;
  winningTeamId: string | null;
  updateScore: (team: 1 | 2, score: number) => Promise<void>;
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
// const updateMatch = (bracket: Bracket, round: number, matchIndex: number, matchData: MatchObj): Bracket => {
//   const newBracket = [...bracket];
//   newBracket[round - 1][matchIndex] = matchData;
//   return newBracket;
// };

// Initialize the bracket
//let bracket: Bracket = createBracket();

// Example: Populate some data
//bracket = updateMatch(bracket, 1, 0, { team1: "Show Muzzy", team2: "Rise", score1: "14", score2: "10", seed1: 1, seed2: 8, winner: 1 });
// bracket = updateMatch(bracket, 1, 1, { team1: "ZTV 18 Meyer", team2: "Bonneville", score1: "11", score2: "12", seed1: 4, seed2: 5, winner: 2 });
// bracket = updateMatch(bracket, 2, 0, { team1: "Show Muzzy", team2: "Bonneville", score1: "8", score2: "11", seed1: 1, seed2: 5, winner: 2 });


const deleteTeam = async (matchId: string | null | undefined, isTopTeam:boolean) => {
  if (matchId) {
      try {
      if (isTopTeam){
        client.models.Match.update({ id:matchId, team1Id:null, team1Score:null }, { authMode: 'userPool' });
      } else {
        client.models.Match.update({ id:matchId, team2Id:null, team2Score:null }, { authMode: 'userPool' });
      }
      return true;
    } catch (error) {
      console.error("Error deleting team:", error);
      return false;
    }
    
  }
  return false;
};



const ViewBrackets: React.FC<ViewbracketsProps> = ({isAdmin}) => {
  const [tournament, setTournament] = useState<Tournament>();
  // const [matches, setMatches] = useState<Match[]>([]);
  const [bracket, setBracket] = useState<Bracket>(createBracket());
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<{match: MatchObj, team: number} | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [confirmationDialog, setConfirmationDialog] = useState<ConfirmationDialogState | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      const { data } = await client.models.Team.list();
      setTeams(data);
    };
    fetchTeams();
  }, []);

  const refreshBracket = async () => {
    if (tournament) {
      await setTournamentData(tournament.id);
    }
  };

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
        const newBracket = createBracket();
        tournamentDbData.data.matches.forEach((match) => 
        {  
          //console.log('match', match);
          const formatScore = (score: number | null, teamExists: boolean) => {
            if (teamExists) {
              return score?.toString() ?? '0';
            }
            return '';
          };

          let team1Exists: boolean = (match.team1 !== null);
          let team2Exists: boolean = (match.team2 !== null);
          // Now set the bracket array for this match
          newBracket[match.round - 1][match.matchNumber - 1] = { 
            matchid: match.id,
            team1: match.team1?.name, 
            team2: match.team2?.name,
            team1id: match.team1Id,
            team2id: match.team2Id, 
            score1: formatScore(match.team1Score, team1Exists), 
            score2: formatScore(match.team2Score, team2Exists), 
            seed1: formatScore(match.team1?.rank, team1Exists), 
            seed2: formatScore(match.team2?.rank, team2Exists), 
            winningTeamId: match.winningTeamId,
            winner: match.winningTeam ? (match.team1?.id === match.winningTeam?.id ? 1 : 2) : 0,
            updateScore: async (team: 1 | 2, score: number) => {
              const updateData = team === 1 
                ? { team1Score: score } 
                : { team2Score: score };
              
              await client.models.Match.update({ 
                id: match.id, 
                ...updateData 
              }, { authMode: 'userPool' });
          
              await refreshBracket();
            }
          };
        })
        setBracket(newBracket);
      }
      
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

      setTournamentData(tournament?.id);
      //console.log(bracket);

    };

    fetchData();
  }, []);

 

  const handleTeamSelect = async (selectedTeam: Team) => {
    if (selectedMatch && selectedMatch.match) {
      const { match, team } = selectedMatch;
      const updateData = team === 1 
        ? { team1Id: selectedTeam.id, team1Score: 0 } 
        : { team2Id: selectedTeam.id, team2Score: 0 };
      
      await client.models.Match.update({ 
        id: match.matchid, 
        ...updateData 
      }, { authMode: 'userPool' });
  
      setIsPopupOpen(false);
      await refreshBracket();
    }
  };

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
              {renderBracketMatchHtml(match, 1, isAdmin, roundIndex, matchIndex)}
              {renderBracketMatchHtml(match, 2, isAdmin, roundIndex, matchIndex)}
            
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

const renderBracketMatchHtml = (bracketMatch: MatchObj, team: number, isAdmin: boolean, roundIndex: number, matchIndex: number) => {
  const handleDeleteTeam = async (e: React.MouseEvent) => {
    e.preventDefault();
    const teamName = team === 1 ? bracketMatch?.team1 : bracketMatch?.team2;
    if (teamName) {
      setConfirmationDialog({
        isOpen: true,
        matchId: bracketMatch?.matchid,
        isTopTeam: team === 1,
        teamName,
        title: "Confirm Team Removal",
        message: `Are you sure you want to remove '${teamName}' from this match?`,
        confirmText: "Yes, remove",
        cancelText: "Cancel"
      });
    }
  };

  const handleAddTeam = async (match: MatchObj | null, team: number, roundIndex: number, matchIndex: number) => {
    let targetMatch = match;
    console.log('handleAddTeam', targetMatch);
    if (!targetMatch) {
      // If the match doesn't exist, create a new one
      const newMatch = await createNewMatch(roundIndex + 1, matchIndex + 1);
      if (newMatch) {
        targetMatch = {
          matchid: newMatch.id,
          team1: null,
          team2: null,
          team1id: null,
          team2id: null,
          score1: '0',
          score2: '0',
          seed1: '',
          seed2: '',
          winningTeamId: null,
          winner: 0,
          updateScore: async (team: 1 | 2, score: number) => {
            const updateData = team === 1 
              ? { team1Score: score } 
              : { team2Score: score };
            
            await client.models.Match.update({ 
              id: newMatch.id, 
              ...updateData 
            }, { authMode: 'userPool' });
  
            await refreshBracket();
          }
        };
      } else {
        console.error("Failed to create new match");
        return;
      }
    }
    
    setSelectedMatch({ match: targetMatch, team });
    setIsPopupOpen(true);
  };

  const handleAddTeamWrapper = () => handleAddTeam(bracketMatch, team, roundIndex, matchIndex);

  const createNewMatch = async (roundNumber: number, matchNumber: number): Promise<Schema['Match']['type'] | null> => {
    if (tournament) {
      try {
        const { data: newMatch } = await client.models.Match.create({
          round: roundNumber,
          matchNumber: matchNumber,
          tournamentId: tournament.id
        }, { authMode: 'userPool' });
        return newMatch;
      } catch (error) {
        console.error("Error creating new match:", error);
        return null;
      }
    }
    return null;
  };

  const handleScoreChange = async (newScore: number) => {
    if (bracketMatch) {
      let updateData: any = {};
      let winningTeamId: string | null = null;
  
      if (team === 1) {
        updateData.team1Score = newScore;
        if (newScore > parseInt(bracketMatch.score2)) {
          winningTeamId = bracketMatch.team1id;
        } else if (newScore < parseInt(bracketMatch.score2)) {
          winningTeamId = bracketMatch.team2id;
        }
      } else {
        updateData.team2Score = newScore;
        if (newScore > parseInt(bracketMatch.score1)) {
          winningTeamId = bracketMatch.team2id;
        } else if (newScore < parseInt(bracketMatch.score1)) {
          winningTeamId = bracketMatch.team1id;
        }
      }
  
      // If scores are equal, set winningTeamId to null
      if (team === 1 && newScore === parseInt(bracketMatch.score2) ||
          team === 2 && newScore === parseInt(bracketMatch.score1)) {
        winningTeamId = null;
      }
  
      updateData.winningTeamId = winningTeamId;
  
      await client.models.Match.update({ 
        id: bracketMatch.matchid, 
        ...updateData 
      }, { authMode: 'userPool' });
  
      await refreshBracket();
    }
  };

  return (

    <div className={`match-${(team === 1 ) ? 'top' : 'bottom' } team`}>
      {isAdmin && (
      <>
        {((team === 1 ? !bracketMatch?.team1 : !bracketMatch?.team2)) ? (
          <span className='plus' onClick={handleAddTeamWrapper}>+</span> 
        ) : (
          <span className='minus' onClick={handleDeleteTeam}> - </span>
        )}
      </>
      )}
      <span className="image"></span>
      <span className="seed">{(team === 1) ? bracketMatch?.seed1 : bracketMatch?.seed2}</span>
      <span className="name">{(team === 1) ? bracketMatch?.team1 : bracketMatch?.team2}</span>
      {/* <span className="score">{(team === 1) ? bracketMatch?.score1 : bracketMatch?.score2}</span>
       */}
       <EditableScore 
        initialScore={(team === 1) ? bracketMatch?.score1 ?? '' : bracketMatch?.score2 ?? ''}
        onScoreChange={handleScoreChange}
        isAdmin={isAdmin}
      />
    </div>
  );
};

const confirmDelete = async () => {
  if (confirmationDialog) {
    const { matchId, isTopTeam, teamName } = confirmationDialog;
    console.log(`Removing team: ${teamName}`);
    const success = await deleteTeam(matchId, isTopTeam);
    if (success) {
      await refreshBracket();
    }
    setConfirmationDialog(null);
  }
};



return (

    <div>
        {tournament ? (<h1>{tournament.name}</h1>) : (<p>Loading tournament...</p>)}
     
        {/* This is the code to generate it from the database */}
        {renderBracket(bracket, isAdmin)}

<TeamSelectionPopup 
  isOpen={isPopupOpen}
  onClose={() => setIsPopupOpen(false)}
  onSelect={handleTeamSelect}
  teams={teams}
/>

{confirmationDialog && (
  <DeleteConfirmationDialog
    isOpen={confirmationDialog.isOpen}
    onConfirm={confirmDelete}
    onCancel={() => setConfirmationDialog(null)}
    title={confirmationDialog.title}
    message={confirmationDialog.message}
    confirmText={confirmationDialog.confirmText}
    cancelText={confirmationDialog.cancelText}
  />
)}

{/* 
<h1>GOLD BRACKET CHAMPIONSHIP</h1>


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
</div> */}

</div>
    );
};

export default ViewBrackets;