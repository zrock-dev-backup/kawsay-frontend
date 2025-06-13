import React from "react";
import {Box, Paper, Typography, Divider, CircularProgress} from "@mui/material";
import { useStudentEnrollment } from "../../hooks/enrollment/useStudentEnrollment";
import AvailableClassesList from "./AvailableClassesList";
import EnrollmentCart from "./EnrollmentCart";

interface Props {
  hook: ReturnType<typeof useStudentEnrollment>;
}

const EnrollmentWorkspace: React.FC<Props> = ({ hook }) => {
  const { state, actions } = hook;

  if (!state.selectedStudent) {
    return (
      <Paper
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "80vh",
        }}
      >
        <Typography color="text.secondary">
          Select a student from the list to begin enrollment.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{ p: 2, height: "80vh", display: "flex", flexDirection: "column" }}
    >
      <Typography variant="h5">{state.selectedStudent.name}</Typography>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: "flex", flexGrow: 1, gap: 2, overflow: "hidden" }}>
        <Box sx={{ flex: 2, overflowY: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Available Classes
          </Typography>
          {state.isLoading ? (
            <CircularProgress />
          ) : (
            <AvailableClassesList
              classes={state.availableClasses}
              onAddToCart={actions.addToCart}
              cartIds={new Set(state.cart.map((c) => c.id))}
            />
          )}
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ flex: 1, overflowY: "auto" }}>
          <Typography variant="h6" gutterBottom>
            Enrollment Cart
          </Typography>
          <EnrollmentCart
            cartItems={state.cart}
            onRemove={actions.removeFromCart}
            onSubmit={actions.handleSubmitEnrollments}
            isSubmitting={state.isSubmitting}
          />
        </Box>
      </Box>
    </Paper>
  );
};
export default EnrollmentWorkspace;
