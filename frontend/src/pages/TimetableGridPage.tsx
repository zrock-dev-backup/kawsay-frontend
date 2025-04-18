
// src/pages/TimetableGridPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  Alert,
  Chip,
  Stack,
} from '@mui/material';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isBetween from 'dayjs/plugin/isBetween';
import { fetchTimetableById } from '../services/apiService';
import type {
    ScheduleItemDto,
    ProcessedScheduleMap, // Type definition updated in apiDataTypes.ts
    ProcessedTimeslot,
    Subject // Import the new Subject interface
} from '../interfaces/apiDataTypes';

dayjs.extend(customParseFormat);
dayjs.extend(isBetween);

const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TimetableGridPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [scheduleItems, setScheduleItems] = useState<ScheduleItemDto[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('No timetable ID provided in URL.');
      setLoading(false);
      return;
    }
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(`Attempting to fetch timetable for ID: ${id}`);
        const data = await fetchTimetableById(id);
        console.log(`Timetable data received for ID ${id}:`, data);
        if (!data || data.length === 0 || !data[0]?.timeslots) {
            console.warn("Received data is missing expected structure:", data);
            throw new Error("Timetable data is incomplete or in unexpected format.");
        }
        setScheduleItems(data);
      } catch (err) {
        console.error(`Error fetching timetable for ID ${id}:`, err);
        setError(err instanceof Error ? err.message : 'Failed to load timetable data.');
        setScheduleItems(null);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // --- Process Data for Grid Rendering using useMemo ---
  const processedData = useMemo(() => {
    if (!scheduleItems?.[0]?.timeslots) {
      return { uniqueDays: [], uniqueTimeslots: [], scheduleMap: {} };
    }

    const timeslotsSource = scheduleItems[0].timeslots;
    const daySet = new Set<string>();
    const timeslotMap = new Map<string, ProcessedTimeslot>();
    // The type ProcessedScheduleMap now expects Subject[] as values
    const map: ProcessedScheduleMap = {};

    for (const timeslotItem of timeslotsSource) {
      const timeslotKey = `${timeslotItem.tStart}-${timeslotItem.tEnd}`;

      if (!timeslotMap.has(timeslotKey)) {
          timeslotMap.set(timeslotKey, { key: timeslotKey, start: timeslotItem.tStart, end: timeslotItem.tEnd });
      }

      for (const dayInfo of timeslotItem.day) {
        daySet.add(dayInfo.name);

        if (!map[dayInfo.name]) {
          map[dayInfo.name] = {};
        }
        if (!map[dayInfo.name][timeslotKey]) {
             map[dayInfo.name][timeslotKey] = []; // Initialize as empty Subject array
        }

        // Merge subjects, avoiding duplicates based on subject ID
        dayInfo.subjects.forEach(subject => {
            // Check if a subject with the same ID already exists in this cell
            if (!map[dayInfo.name][timeslotKey].some(existingSub => existingSub.id === subject.id)) {
                map[dayInfo.name][timeslotKey].push(subject); // Push the Subject object
            }
        });
      }
    }

    // Sort unique days
    const uniqueDays = Array.from(daySet).sort((a, b) => {
        const indexA = dayOrder.indexOf(a); const indexB = dayOrder.indexOf(b);
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1; if (indexB === -1) return -1;
        return indexA - indexB;
     });

    // Sort unique timeslots
    const uniqueTimeslots = Array.from(timeslotMap.values()).sort((a, b) => {
        const timeA = dayjs(a.start, 'HH:mm'); const timeB = dayjs(b.start, 'HH:mm');
        if (!timeA.isValid() || !timeB.isValid()) return 0; // Handle invalid times
        if (timeA.isBefore(timeB)) return -1; if (timeA.isAfter(timeB)) return 1;
        const endA = dayjs(a.end, 'HH:mm'); const endB = dayjs(b.end, 'HH:mm');
        if (!endA.isValid() || !endB.isValid()) return 0;
         if (endA.isBefore(endB)) return -1; if (endA.isAfter(endB)) return 1;
        return 0;
     });

    return { uniqueDays, uniqueTimeslots, scheduleMap: map };

  }, [scheduleItems]);

  const { uniqueDays, uniqueTimeslots, scheduleMap } = processedData;

  // Click handler for subjects - UPDATED to accept Subject object
  const handleLessonClick = (subject: Subject, day: string, timeslot: ProcessedTimeslot) => {
    console.log(`Clicked Subject: ID=${subject.id}, Title=${subject.title}, Day: ${day}, Time: ${timeslot.key}`);
    // Navigate to edit page using subject ID
    // Ensure the route /edit-lesson/:lessonId corresponds to these subject IDs
    // and that the backend /api/lesson/{id} endpoint can serve data for these IDs.
    navigate(`/edit-lesson/${subject.id}`);
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
         <Typography sx={{ ml: 2 }}>Loading timetable...</Typography>
      </Box>
    );
  }

  if (error) {
     return (
       <Container>
         <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
       </Container>
     );
  }

  // Check after loading and error checks
  if (!scheduleItems || uniqueDays.length === 0 || uniqueTimeslots.length === 0) {
     return (
       <Container>
         <Typography sx={{ mt: 2 }}>No timetable data available or data is empty for ID: {id}.</Typography>
       </Container>
     );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', my: 3 }}>
        Timetable {id ? `(ID: ${id})` : ''}
      </Typography>

      <TableContainer component={Paper} elevation={3}>
        <Table sx={{ minWidth: 700 }} aria-label={`Timetable ${id}`}>
          {/* Table Header */}
          <TableHead sx={{ backgroundColor: 'grey.200' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '120px', position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'grey.200' }}>Time</TableCell>
              {uniqueDays.map((dayName) => (
                <TableCell key={dayName} align="center" sx={{ fontWeight: 'bold' }}>{dayName}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body */}
          <TableBody>
            {uniqueTimeslots.map((timeslot) => (
              <TableRow key={timeslot.key} hover>
                {/* Timeslot Cell */}
                <TableCell component="th" scope="row" sx={{ fontWeight: 'medium', verticalAlign: 'top', position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'background.paper' }}>
                  {`${timeslot.start} - ${timeslot.end}`}
                </TableCell>

                {/* Subject Cells */}
                {uniqueDays.map((dayName) => {
                  // Find Subject objects for the current cell
                  const subjectsInCell: Subject[] = scheduleMap[dayName]?.[timeslot.key] || [];

                  return (
                    <TableCell key={`${dayName}-${timeslot.key}`} align="center" sx={{ verticalAlign: 'top', border: '1px solid rgba(224, 224, 224, 1)', p: 1 }}>
                      {subjectsInCell.length > 0 ? (
                        <Stack spacing={1} direction="column" alignItems="stretch">
                          {/* Map over Subject objects */}
                          {subjectsInCell.map((subject) => (
                            <Chip
                              // Use subject.id for a stable key
                              key={subject.id}
                              // Display subject.title
                              label={subject.title}
                              // Pass the whole subject object to the handler
                              onClick={() => handleLessonClick(subject, dayName, timeslot)}
                              variant="outlined"
                              color="primary"
                              size="small"
                              sx={{ cursor: 'pointer', width: '100%', justifyContent: 'flex-start', textAlign: 'left' }}
                            />
                          ))}
                        </Stack>
                      ) : ( null )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TimetableGridPage;
