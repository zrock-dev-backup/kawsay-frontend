import React from 'react';
import {Box, Button, Paper, Step, StepLabel, Stepper, Typography} from '@mui/material';

const Step1 = () => <Typography>Step 1: Define Class Details</Typography>;
const Step2 = () => <Typography>Step 2: Set Schedule</Typography>;

const steps = ['Define Class Details', 'Set Schedule & Preferences'];

export const ClassCreationWizard: React.FC = () => {
    const [activeStep, setActiveStep] = React.useState(0);

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    return (
        <Paper elevation={3} sx={{p: 3}}>
            <Stepper activeStep={activeStep} sx={{mb: 3}}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box>
                {activeStep === 0 && <Step1/>}
                {activeStep === 1 && <Step2/>}
            </Box>

            <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    sx={{mr: 1}}
                >
                    Back
                </Button>
                <Button variant="contained" onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Create Class' : 'Next'}
                </Button>
            </Box>
        </Paper>
    );
};
