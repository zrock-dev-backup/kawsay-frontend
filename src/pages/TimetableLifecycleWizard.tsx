import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useTimetableStore } from "../stores/useTimetableStore";
import { useCourseRequirementStore } from "../stores/useCourseRequirementStore";
import { useSchedulingStore } from "../stores/useSchedulingStore";
import { useStudentAudit } from "../hooks/useStudentAudit";
import { useAcademicStructure } from "../hooks/useAcademicStructure";
import AcademicStructureManager from "../components/academic-structure/AcademicStructureManager";
import CourseRequirementsTab from "./CourseRequirementsTab";
import AssistedSchedulingTab from "./AssistedSchedulingTab";
import { StudentAuditTab } from "../components/audit/StudentAuditTab";
import Step5_Publish from "./wizard-steps/Step5_Publish";
import { TimetableWizardIndex } from "../utils/tabIndex.ts";

const steps = [
  "Define Academic Structure",
  "Define Module Requirements",
  "Build Schedule",
  "Audit Student Enrollments",
  "Publish Timetable",
];

const TimetableLifecycleWizard: React.FC = () => {
  const { structure, wizardStep, setWizardStep, goToNextWizardStep } =
    useTimetableStore();
  const timetableId = structure?.id.toString();

  // --- State selectors for step completion gating ---
  const { cohorts } = useAcademicStructure(timetableId);
  const { requirements } = useCourseRequirementStore();
  const { stagedPlacements } = useSchedulingStore();
  const { state: auditState, actions: auditActions } = useStudentAudit(
    timetableId!,
  );
  const [isStepComplete, setIsStepComplete] = useState(false);

  useEffect(() => {
    let isComplete = false;
    switch (wizardStep) {
      case TimetableWizardIndex.ACADEMIC_STRUCTURE: // Academic Structure
        isComplete = cohorts.length > 0;
        break;
      case TimetableWizardIndex.COURSE_REQUIREMENTS: // Module Requirements
        isComplete = requirements.length > 0;
        break;
      case TimetableWizardIndex.ASSISTED_SCHEDULING: // Build Schedule (Completion is handled by the component's internal 'Finalize' action)
        isComplete =
          stagedPlacements.length > 0 &&
          requirements.length === stagedPlacements.length;
        break;
      case TimetableWizardIndex.AUDIT_STUDENTS: // Audit Enrollments
        isComplete =
          auditState.students.length > 0 &&
          auditState.students.every((s) => s.status !== "ReadyToEnroll");
        break;
      case TimetableWizardIndex.SCHEDULE:
        isComplete = true; // Always able to click "publish"
        break;
    }
    setIsStepComplete(isComplete);
  }, [
    wizardStep,
    cohorts,
    requirements,
    stagedPlacements,
    auditState.students,
  ]);

  const renderStepContent = (step: number) => {
    if (!timetableId) return <Typography>Loading...</Typography>;

    switch (step) {
      case TimetableWizardIndex.ACADEMIC_STRUCTURE: // Academic Structure
        return <AcademicStructureManager />;
      case TimetableWizardIndex.COURSE_REQUIREMENTS: // Module Requirements
        return <CourseRequirementsTab timetableId={timetableId} />;
      case TimetableWizardIndex.ASSISTED_SCHEDULING: // Build Schedule (Completion is handled by the component's internal 'Finalize' action)
        return <AssistedSchedulingTab />;
      case TimetableWizardIndex.AUDIT_STUDENTS: // Audit Enrollments
        return (
          <StudentAuditTab
            auditState={auditState}
            auditActions={auditActions}
          />
        );
      case TimetableWizardIndex.SCHEDULE: // Publish
        return <Step5_Publish />;
      default:
        return <Typography>Unknown step</Typography>;
    }
  };

  const handleBack = () => {
    setWizardStep(wizardStep - 1);
  };

  const isFinalizeStep = wizardStep === 2;
  const isPublishStep = wizardStep === 4;

  return (
    <Paper sx={{ p: { xs: 2, md: 3 } }}>
      <Stepper activeStep={wizardStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 2 }}>
        <Button
          color="inherit"
          disabled={wizardStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        {!isFinalizeStep && !isPublishStep && (
          <Button
            variant="contained"
            onClick={goToNextWizardStep}
            disabled={!isStepComplete}
          >
            Next
          </Button>
        )}
      </Box>
      <Box sx={{ mt: 4, minHeight: "60vh" }}>
        {renderStepContent(wizardStep)}
      </Box>
    </Paper>
  );
};

export default TimetableLifecycleWizard;
