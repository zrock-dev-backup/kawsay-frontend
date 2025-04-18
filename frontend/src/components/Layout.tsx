import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';

const Layout: React.FC = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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

            <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                <Outlet /> {/* Child routes defined in App.tsx will render here */}
            </Container>

            <Box component="footer" sx={{ p: 2, mt: 'auto', backgroundColor: 'grey.200' }}>
                <Typography variant="body2" color="text.secondary" align="center">
                    {new Date().getFullYear()}
                    {'.'}
                </Typography>
            </Box>
        </Box>
    );
};

export default Layout;