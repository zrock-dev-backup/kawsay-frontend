import React from 'react';
import { Typography, Container, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/material/Link';

const NotFoundPage: React.FC = () => {
    return (
        <Container>
            <Box textAlign="center" mt={5}>
                <Typography variant="h4" gutterBottom>
                    404 - Page Not Found
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Sorry, the page you are looking for does not exist.
                </Typography>
                <Link component={RouterLink} to="/" variant="button">
                    Go to Home Page
                </Link>
            </Box>
        </Container>
    );
};

export default NotFoundPage;