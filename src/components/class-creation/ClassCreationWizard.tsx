import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useClassCreationWizard } from "../../hooks/lecture/useClassCreationWizard";
import { Step1_DefineClass } from "./Step1_DefineClass.tsx";
import { Step2_SetSchedule } from "./Step2_SetSchedule.tsx";

const steps = ["Define Class Details", "Set Schedule & Preferences"];

interface Props {
  wizard: ReturnType<typeof useClassCreationWizard>;
}

export const ClassCreationWizard: React.FC<Props> = ({ wizard }) => {
  const { state, handleStep, handleSubmit } = wizard;
  const isEditMode = state.form.id !== null;
  const isLastStep = state.step === steps.length - 1;

  const handleFormSubmit = async () => {
    const success = await handleSubmit();
    if (success) {
      console.log("success");
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {isEditMode
          ? `Editing Class: ${state.form.courseId}`
          : "Create New Class"}
      </Typography>

      <Stepper activeStep={state.step} sx={{ mb: 3 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {state.step === 0 && <Step1_DefineClass wizard={wizard} />}
      {state.step === 1 && <Step2_SetSchedule wizard={wizard} />}

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
        <Button
          disabled={state.step === 0}
          onClick={() => handleStep("back")}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={isLastStep ? handleFormSubmit : () => handleStep("next")}
          disabled={state.isSubmitting}
        >
          {state.isSubmitting ? (
            <CircularProgress size={24} />
          ) : isLastStep ? (
            isEditMode ? (
              "Save Changes"
            ) : (
              "Create Class"
            )
          ) : (
            "Next"
          )}
        </Button>
      </Box>
    </Box>
  );
};
