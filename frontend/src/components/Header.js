import React from 'react';
import { Link } from 'react-router-dom';
import {
  Button,
  Text,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Avatar,
} from '@fluentui/react-components';
import { AppsList24Regular, Person24Regular } from '@fluentui/react-icons';

const Header = () => {
  return (
    <header className="app-header">
      <div className="header-logo">
        <AppsList24Regular />
        <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
          <Text size={800} weight="bold">Job Coach AI Assistant</Text>
        </Link>
      </div>
      
      <div className="header-nav">
        <Menu>
          <MenuTrigger>
            <Button icon={<Avatar aria-label="User Profile" />} />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              <MenuItem icon={<Person24Regular />}>Profile</MenuItem>
            </MenuList>
          </MenuPopover>
        </Menu>
      </div>
    </header>
  );
};

export default Header; 