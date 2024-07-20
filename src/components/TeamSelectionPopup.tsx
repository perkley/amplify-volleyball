import React, { useState } from 'react';
import type { Schema } from "../../amplify/data/resource";

type Team = Schema['Team']['type'];

interface TeamSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (team: Team) => void;
  teams: Team[];
}

const TeamSelectionPopup: React.FC<TeamSelectionPopupProps> = ({ isOpen, onClose, onSelect, teams }) => {
  const [filter, setFilter] = useState('');
  const filteredTeams = teams.filter(team => 
    team.name?.toLowerCase().includes(filter.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="popup">
      <div className="popup-content">
        <input 
          type="text" 
          placeholder="Filter teams..." 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
        />
        <ul>
          {filteredTeams.map(team => (
            <li key={team.id} onClick={() => onSelect(team)}>
              {team.name} (Rank: {team.rank})
            </li>
          ))}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default TeamSelectionPopup;