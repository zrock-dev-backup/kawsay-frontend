import React from 'react';
import {Box, Button, CircularProgress, Grid, Paper, Step, StepLabel, Stepper} from '@mui/material';
import {useClassCreationWizard} from '../../hooks/lecture/useClassCreationWizard.ts';
import {Step1_DefineClass} from "./Step1_DefineClass.tsx";
import {Step2_SetSchedule} from "./Step2_SetSchedule.tsx";
import {LiveSchedulePreview} from "./LiveSchedulePreview.tsx";

const steps = ['Define Class Details', 'Set Schedule & Preferences'];

interface Props {
    wizard: ReturnType<typeof useClassCreationWizard>;
}

export const ClassCreationWizard: React.FC<Props> = ({wizard}) => {
    const {state, handleStep, handleSubmit} = wizard;
    const isLastStep = state.step === steps.length - 1;

    return (
        <Grid container spacing={3}>
            <Grid size={{xs: 12, sm: 7}}>
                <Paper elevation={3} sx={{p: 3}}>
                    <Stepper activeStep={state.step} sx={{mb: 3}}>
                        {steps.map((label) => (
                            <Step key={label}><StepLabel>{label}</StepLabel></Step>
                        ))}
                    </Stepper>

                    {state.step === 0 && <Step1_DefineClass wizard={wizard}/>}
                    {state.step === 1 && <Step2_SetSchedule wizard={wizard}/>}

                    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 3}}>
                        <Button disabled={state.step === 0} onClick={() => handleStep('back')} sx={{mr: 1}}>
                            Back
                        </Button>
                        <Button variant="contained" onClick={isLastStep ? handleSubmit : () => handleStep('next')}
                                disabled={state.isSubmitting}>
                            {state.isSubmitting ?
                                <CircularProgress size={24}/> : (isLastStep ? 'Create Class' : 'Next')}
                        </Button>
                    </Box>
                </Paper>
            </Grid>
            <Grid size={{xs: 12, sm: 7}}>
                <LiveSchedulePreview wizard={wizard}/>
            </Grid>
        </Grid>
    );
};
