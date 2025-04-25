import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Alert,
    Box,
} from '@mui/material';
import type { Track } from '../interfaces/apiDataTypes';
import { fetchTracks } from '../services/apiService';

const TrackSelectionPage: React.FC = () => {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadTracks = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Attempting to fetch tracks...');
                const data = await fetchTracks();
                console.log('Tracks fetched successfully:', data);
                setTracks(data);
            } catch (err) {
                console.error('Error fetching tracks:', err);
                setError(
                    err instanceof Error ? err.message : 'An unknown error occurred while fetching tracks.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadTracks();

    }, []);

    const handleTrackClick = (id: number) => {
        console.log(`Navigating to /table/${id}`);
        navigate(`/table/${id}`);
    };

    let content;
    if (loading) {
        content = (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading tracks...</Typography>
            </Box>
        );
    } else if (error) {
        content = (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    } else if (tracks.length === 0) {
        content = (
            <Typography sx={{mt: 2}}>No tracks found.</Typography>
        );
    }
    else {
        content = (
            <List sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
                {tracks.map((track) => (
                    <ListItem key={track.id} disablePadding>
                        <ListItemButton onClick={() => handleTrackClick(track.id)}>
                            <ListItemText primary={track.title} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        );
    }

    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Select a Timetable Track
            </Typography>
            {content}
        </Container>
    );
};

export default TrackSelectionPage;