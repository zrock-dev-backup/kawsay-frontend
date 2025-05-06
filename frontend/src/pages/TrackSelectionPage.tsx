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
import type { TimetableStructure } from '../interfaces/apiDataTypes';
import { fetchTimetables } from '../services/apiService';
const TrackSelectionPage: React.FC = () => {
    const [timetables, setTimetables] = useState<TimetableStructure[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        const loadTimetables = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log('Attempting to fetch timetables...');
                const data = await fetchTimetables();
                console.log('Timetables fetched successfully:', data);
                setTimetables(data);
            } catch (err) {
                console.error('Error fetching timetables:', err);
                setError(
                    err instanceof Error ? err.message : 'An unknown error occurred while fetching timetables.'
                );
            } finally {
                setLoading(false);
            }
        };
        loadTimetables();
    }, []);
    const handleTimetableClick = (id: number) => {
        console.log(`Navigating to /table/${id}`);
        navigate(`/table/${id}`);
    };
    let content;
    if (loading) {
        content = (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading timetables...</Typography>
            </Box>
        );
    } else if (error) {
        content = (
            <Alert severity="error" sx={{ mt: 2 }}>
                {error}
            </Alert>
        );
    } else if (timetables.length === 0) {
        content = (
            <Typography sx={{mt: 2}}>No timetables found.</Typography>
        );
    }
    else {
        content = (
            <List sx={{ width: '100%', bgcolor: 'background.paper', mt: 2 }}>
                {timetables.map((timetable) => (
                    <ListItem key={timetable.id} disablePadding>
                        <ListItemButton onClick={() => handleTimetableClick(timetable.id)}>
                            <ListItemText primary={timetable.name} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        );
    }
    return (
        <Container maxWidth="sm">
            <Typography variant="h4" gutterBottom>
                Select a Timetable
            </Typography>
            {content}
        </Container>
    );
};
export default TrackSelectionPage;
