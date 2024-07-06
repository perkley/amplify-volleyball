import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Divider, Menu, MenuItem } from '@aws-amplify/ui-react';

interface AppMenuProps {
    signOut: (() => void) | undefined;
    createPool: () => void;  // Adjust this type if createPool takes any parameters
    isAdmin: boolean;
}

const AppMenu: React.FC<AppMenuProps> = ({ signOut, createPool, isAdmin }) => {
  const navigate = useNavigate();

  return (
    <Menu menuAlign="start">
      
      <MenuItem onClick={() => navigate("/")}>
        View Score Card
      </MenuItem>
      <MenuItem onClick={() => navigate("/brackets")}>
        View Brackets
      </MenuItem>
      {isAdmin && <>
      <Divider />
      <MenuItem onClick={createPool}>
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