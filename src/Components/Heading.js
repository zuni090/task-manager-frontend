import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

const Header = (props) => {
  return (
    <>
    <AppBar position="static" style={{ backgroundColor: '#2196F3'}}>
        <Toolbar>
            <Typography variant="h6" style={{ flexGrow: 1 }}>
            {props.title}
            </Typography>
        </Toolbar>
    </AppBar>
    </>
  )
}

export default Header;

