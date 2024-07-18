import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider, Menu, MenuItem } from '@aws-amplify/ui-react';
import { seedPoolGroupData, deleteAllData, seedBracketsData } from './SeedData';

interface AppMenuProps {
    signOut: (() => void) | undefined;
    isAdmin: boolean;
}

const AppMenu: React.FC<AppMenuProps> = ({ signOut, isAdmin }) => {
  const navigate = useNavigate();

  return (
    <Menu menuAlign="start">
      
      <MenuItem onClick={() => navigate("/")}>
        View Pool Groups
      </MenuItem>
      <MenuItem onClick={() => navigate("/brackets")}>
        View Brackets
      </MenuItem>
      {isAdmin && <>
      <Divider />
      <MenuItem onClick={seedPoolGroupData}>
        Seed Pool Group Data
      </MenuItem>
      <MenuItem onClick={seedBracketsData}>
        Seed Bracket Data
      </MenuItem>
      <MenuItem onClick={deleteAllData}>
        Delete All Data
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