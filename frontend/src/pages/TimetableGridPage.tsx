// src/pages/TimetableGridPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { // ... other imports
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
  Button, // Import Button
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Import AddIcon
// ... other imports

// ... (rest of the component code)

const TimetableGridPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Timetable ID
  const navigate = useNavigate(); // Keep useNavigate as we'll use it for the button

  // ... (state and useEffect for fetching data)

  // ... (useMemo for processing data)

  // Handle click on a class chip (no navigation in this version)
  const handleLessonClick = (classId: number) => { // Receive classId
    console.log(`Clicked Class ID: ${classId}. Opening details modal.`);
    setSelectedClassId(classId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setSelectedClassId(null);
  };

  // Handler for the "Create Class" button
  const handleCreateClassClick = () => {
      if (id) {
          console.log(`Navigating to class creation for timetable ID: ${id}`);
          navigate(`/table/${id}/create-class`);
      }
  };


  // --- Render Logic ---

  if (loading) {
    // ... (loading state)
  }

  if (error && !timetableStructure) {
    // ... (error state)
  }

  if (!timetableStructure) {
      // ... (no structure state)
   }

  // If we have structure but no days/periods, show message
  if (timetableStructure && (uniqueDays.length === 0 || uniquePeriods.length === 0)) {
      return (
        <Container maxWidth="lg"> {/* Use lg for consistency */}
            <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', my: 3 }}>
                Timetable: {timetableStructure.name} {id ? `(ID: ${id})` : ''}
            </Typography>
            <Alert severity="info" sx={{ mt: 2 }}>
                This timetable has no days or time periods defined. You cannot schedule classes until periods are added.
            </Alert>
             {/* Optionally add a button to edit timetable structure here later */}
        </Container>
      );
  }


   // If we have structure and periods/days, but no classes, show message and Create button
  if (timetableStructure && classes.length === 0) {
       return (
         <Container maxWidth="lg"> {/* Use lg for consistency */}
           <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', my: 3 }}>
             Timetable: {timetableStructure.name} {id ? `(ID: ${id})` : ''}
           </Typography>
           <Alert severity="info" sx={{ mt: 2 }}>
               No classes scheduled for this timetable yet.
           </Alert>
            {/* Add Create Class Button here */}
            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClassClick}
                    disabled={!timetableStructure || uniqueDays.length === 0 || uniquePeriods.length === 0} // Disable if structure is incomplete
                >
                    Add First Class
                </Button>
            </Box>
         </Container>
       );
   }


   // If we reach here, we have timetable structure AND classes to display
   // Render the grid and the "Add Class" button
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', my: 3 }}>
        Timetable: {timetableStructure.name} {id ? `(ID: ${id})` : ''}
      </Typography>

      {/* Add Create Class Button above the grid */}
      <Box sx={{ mb: 2, textAlign: 'right' }}>
           <Button
               variant="contained"
               startIcon={<AddIcon />}
               onClick={handleCreateClassClick}
               disabled={!timetableStructure || uniqueDays.length === 0 || uniquePeriods.length === 0} // Disable if structure is incomplete
           >
               Add Class
           </Button>
       </Box>


      <TableContainer component={Paper} elevation={3} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 700 }} aria-label={`Timetable ${id}`}>

          {/* Table Header (Days) */}
          <TableHead sx={{ backgroundColor: 'grey.200' }}>
            <TableRow>
              {/* Corner cell for Time */}
              <TableCell sx={{ fontWeight: 'bold', width: '120px', minWidth: '120px', position: 'sticky', left: 0, zIndex: 2, backgroundColor: 'grey.200' }}>Time</TableCell>
              {/* Day headers */}
              {uniqueDays.map((day) => (
                <TableCell key={day.id} align="center" sx={{ fontWeight: 'bold', minWidth: '150px' }}>{day.name}</TableCell>
              ))}
            </TableRow>
          </TableHead>

          {/* Table Body (Periods and Classes) */}
          <TableBody>
            {uniquePeriods.map((period) => (
              <TableRow key={period.id} hover>
                {/* Time Period Cell */}
                <TableCell
                    component="th"
                    scope="row"
                    sx={{
                        fontWeight: 'medium',
                        verticalAlign: 'top',
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        backgroundColor: 'background.paper',
                        width: '120px',
                        minWidth: '120px'
                    }}
                >
                  {`${period.start} - ${period.end}`}
                </TableCell>

                {/* Cells for each Day/Period intersection */}
                {uniqueDays.map((day) => {
                  // Get occurrences that START in this specific day/period cell
                  const occurrencesInCell: GridCellContent[] = scheduleMap[day.id]?.[period.id] || [];

                  // Note: This current rendering approach places *all* occurrences that start in a cell
                  // within that cell. For occurrences spanning multiple periods, you might want
                  // a more advanced rendering logic (e.g., calculating rowSpan, or placing the chip
                  // only in the first cell and visually extending it).
                  // For simplicity in this refactor, we'll just list all occurrences starting here.
                  // A future enhancement would be to calculate rowSpan based on occurrence.length
                  // and hide chips in subsequent cells covered by a longer occurrence.

                  return (
                    <TableCell
                        key={`${day.id}-${period.id}`}
                        align="center"
                        sx={{
                            verticalAlign: 'top',
                            border: '1px solid rgba(224, 224, 224, 1)',
                            p: 1,
                            minWidth: '150px'
                        }}
                    >
                      {occurrencesInCell.length > 0 ? (
                        <Stack spacing={1} direction="column" alignItems="stretch">
                          {/* Render chips for each occurrence starting in this cell */}
                          {occurrencesInCell.map((content) => (
                            <Chip
                              key={content.occurrenceId} // Use occurrence ID as key
                              label={`${content.courseName} ${content.teacherName ? `(${content.teacherName})` : ''} (${content.length} periods)`} // Display course, teacher, length
                              onClick={() => handleLessonClick(content.classId)} // Pass class ID to handler
                              variant="outlined"
                              color="primary"
                              size="small"
                              sx={{ cursor: 'pointer', width: '100%', justifyContent: 'flex-start', textAlign: 'left', height: 'auto' }}
                            />
                          ))}
                        </Stack>
                      ) : (
                         // Render an empty box or similar if no classes start in this slot
                         <Box sx={{ minHeight: '24px' }}></Box> // Add minHeight to keep rows consistent
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Class Details Modal */}
      <ClassDetailsModal
          classId={selectedClassId}
          open={isModalOpen}
          onClose={handleCloseModal}
          timetableStructure={timetableStructure} // Pass structure to modal for time/day mapping
      />

    </Container>
  );
};

export default TimetableGridPage;
