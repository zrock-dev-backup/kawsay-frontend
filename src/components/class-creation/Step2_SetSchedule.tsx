import React from 'react';
import {Grid, TextField, Typography} from '@mui/material'; // Correct, modern import
import {DatePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, {Dayjs} from "dayjs";
import {useClassCreationWizard} from '../../hooks/lecture/useClassCreationWizard.ts';
import SlotPicker from "../lecture/SlotPicker.tsx";

interface Props {
    wizard: ReturnType<typeof useClassCreationWizard>;
}

export const Step2_SetSchedule: React.FC<Props> = ({wizard}) => {
    const {state, setFormValue} = wizard;

    const sortedPeriods = React.useMemo(() => {
        if (!state.timetableStructure?.periods) return [];
        return [...state.timetableStructure.periods].sort((a, b) =>
            a.start.localeCompare(b.start)
        );
    }, [state.timetableStructure?.periods]);

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={3}>
                <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                        label="Periods Length"
                        type="number"
                        required
                        fullWidth
                        value={state.form.length}
                        onChange={(e) => setFormValue('length', Number(e.target.value))}
                        InputProps={{inputProps: {min: 1}}}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                    <TextField
                        label="Frequency (per week)"
                        type="number"
                        required
                        fullWidth
                        value={state.form.frequency}
                        onChange={(e) => setFormValue('frequency', Number(e.target.value))}
                        InputProps={{inputProps: {min: 1}}}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                    <DatePicker
                        label="Class Start Date (Optional)"
                        value={state.form.startDate}
                        onChange={(newValue: Dayjs | null) => setFormValue('startDate', newValue)}
                        minDate={dayjs(state.timetableStructure?.startDate)}
                        maxDate={dayjs(state.timetableStructure?.endDate)}
                    />
                </Grid>
                <Grid size={{xs: 12, sm: 6}}>
                    <DatePicker
                        label="Class End Date (Optional)"
                        value={state.form.endDate}
                        onChange={(newValue: Dayjs | null) => setFormValue('endDate', newValue)}
                        minDate={state.form.startDate ?? dayjs(state.timetableStructure?.startDate)}
                        maxDate={dayjs(state.timetableStructure?.endDate)}
                    />
                </Grid>
                <Grid size={{xs: 12}}>
                    <Typography variant="h6" gutterBottom>Preferences</Typography>
                    <SlotPicker
                        days={state.timetableStructure?.days ?? []}
                        periods={sortedPeriods}
                        length={state.form.length}
                        value={state.form.periodPreferences}
                        onChange={(newValue) => setFormValue('periodPreferences', newValue)}
                    />
                </Grid>
            </Grid>
        </LocalizationProvider>
    );
};
