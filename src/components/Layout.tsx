import React from 'react';
import {Link as RouterLink, Outlet} from 'react-router-dom';
import {AppBar, Box, Button, Container, Toolbar, Typography} from '@mui/material';

const Layout: React.FC = () => {
    return (
        <Box sx={{display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%'}}>
            <AppBar position="static" sx={{width: '100%'}}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                        Kawsay
                    </Typography>
                    <Button color="inherit" component={RouterLink} to="/">
                        Home
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/creation">
                        Create table
                    </Button>
                    <Button color="inherit" component={RouterLink} to="/selection">
                        Select track
                    </Button>
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{mt: 4, mb: 4, flexGrow: 1}}>
                <Outlet/>
            </Container>
            <Box component="footer" sx={{p: 2, mt: 'auto', backgroundColor: 'grey.200', width: '100%'}}>
                <Typography variant="body2" color="text.secondary" align="center">
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Box>
        </Box>
    );
};
export default Layout;