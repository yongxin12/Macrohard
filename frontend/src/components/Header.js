import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Tooltip,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Avatar,
  Text
} from '@fluentui/react-components';
import { SignalAlt, Person, SignOut } from '@fluentui/react-icons';

// Import the MSAL authentication context for sign-in/sign-out functionality
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from '../authConfig';

const Header = () => {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest).catch(error => {
      console.log(error);
    });
  };

  const handleLogout = () => {
    instance.logoutRedirect().catch(error => {
      console.log(error);
    });
  };

  const userName = accounts.length > 0 ? accounts[0].name : 'User';
  const userEmail = accounts.length > 0 ? accounts[0].username : '';
  const initials = accounts.length > 0 && accounts[0].name ? 
    accounts[0].name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  return (
    <header className="app-header">
      <div className="header-logo">
        <SignalAlt fontSize={24} />
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <h1 className="header-title">Job Coach AI Assistant</h1>
        </Link>
      </div>
      
      <div className="header-nav">
        {isAuthenticated ? (
          <Menu>
            <MenuTrigger disableButtonEnhancement>
              <Button appearance="transparent" icon={
                <Avatar name={userName} size={36} color="brand">
                  {initials}
                </Avatar>
              }>
                <Text style={{ color: 'white' }}>{userName}</Text>
              </Button>
            </MenuTrigger>
            <MenuPopover>
              <MenuList>
                <MenuItem icon={<Person />}>
                  Profile
                </MenuItem>
                <MenuItem icon={<SignOut />} onClick={handleLogout}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </MenuPopover>
          </Menu>
        ) : (
          <Button appearance="primary" onClick={handleLogin}>Sign In</Button>
        )}
      </div>
    </header>
  );
};

export default Header; 