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
import type { Track } from '../interfaces/Track.ts';

const fetchTracksFromAPI = async (): Promise<Track[]> => {
    console.log('Fetching tracks from API...');

    await new Promise((resolve) => setTimeout(resolve, 1000));


    const mockData: Track[] = [
        { id: 1, title: 'Spanish Track' },
        { id: 2, title: 'English Track' },
        { id: 3, title: 'Advanced Calculus Schedule' },
        { id: 15, title: 'Beginner Programming Timetable' },
    ];

    console.log('Tracks fetched successfully.');
    return mockData;
};


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
                const data = await fetchTracksFromAPI();
                setTracks(data);
            } catch (err) {
                console.error('Error fetching tracks:', err);
                setError(
                    err instanceof Error ? err.message : 'An unknown error occurred.'
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