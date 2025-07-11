import React from "react";
import { useParams } from "react-router-dom";
import {
  Alert,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { useStudentEnrollment } from "../hooks/enrollment/useStudentEnrollment.ts";
import StudentSelector from "../components/enrollment/StudentSelector.tsx";
import EnrollmentWorkspace from "../components/enrollment/EnrollmentWorkspace.tsx";

const StudentEnrollmentPage: React.FC = () => {
  const { timetableId } = useParams<{ timetableId: string }>();

  if (!timetableId) {
    return (
      <Alert severity="error">Timetable ID is missing from the URL.</Alert>
    );
  }

  const { state, actions } = useStudentEnrollment(Number(timetableId));

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Student Enrollment
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
        Timetable ID: {timetableId}
      </Typography>

      {state.submitStatus && (
        <Alert
          severity={state.submitStatus.type}
          sx={{ mb: 2 }}
          onClose={() => actions.setSubmitStatus(null)}
        >
          {state.submitStatus.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{xs:12, md:3}}>
          <Paper sx={{ p: 2, height: "80vh", overflowY: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Select Student
            </Typography>
            {state.isLoading && !state.students.length ? (
              <CircularProgress />
            ) : (
              <StudentSelector
                students={state.students}
                selectedStudentId={state.selectedStudent?.id ?? null}
                onSelect={actions.handleSelectStudent}
              />
            )}
          </Paper>
        </Grid>
        <Grid size={{xs:12, md:9}}>
          <EnrollmentWorkspace hook={{ state, actions }} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentEnrollmentPage;
