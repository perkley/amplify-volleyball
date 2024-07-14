import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider, Menu, MenuItem } from '@aws-amplify/ui-react';

interface AppMenuProps {
    signOut: (() => void) | undefined;
    createTournamentStructure: () => void;  // Adjust this type if createTournamentStructure takes any parameters
    isAdmin: boolean;
}

const AppMenu: React.FC<AppMenuProps> = ({ signOut, createTournamentStructure, isAdmin }) => {
  const navigate = useNavigate();

  return (
    <Menu menuAlign="start">
      
      <MenuItem onClick={() => navigate("/")}>
        View Pool Score Card
      </MenuItem>
      <MenuItem onClick={() => navigate("/brackets")}>
        View Brackets
      </MenuItem>
      {isAdmin && <>
      <Divider />
      <MenuItem onClick={createTournamentStructure}>
        Create Default List
      </MenuItem>
      </>}
      <Divider />
    
      <MenuItem onClick={signOut}>
        Sign Out
      </MenuItem>
    </Menu>
  );
};

export default AppMenu;