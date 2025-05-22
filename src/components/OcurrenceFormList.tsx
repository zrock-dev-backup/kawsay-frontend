import React from 'react';
import {
    Paper,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormHelperText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { TimetablePeriod } from '../interfaces/apiDataTypes';

interface OccurrenceFormListProps {
    control: any;
    fields: any;
    remove: any;
    sortedPeriods: TimetablePeriod[];
    isSubmitting: boolean;
    errors: any;
}

const OccurrenceFormList: React.FC<OccurrenceFormListProps> = (
    {
        control,
        fields,
        remove,
        sortedPeriods,
        isSubmitting,
        errors
    }) => {

    return (
        <>
            {fields.map((field, index) => (
                <Paper
                    key={field.id}
                    elevation={2}
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: {xs: 'column', sm: 'row'},
                        alignItems: 'flex-start',
                        gap: 2
                    }}
                >
                    <FormControl
                        required
                        sx={{minWidth: 180, flexGrow: 1}}
                        disabled={isSubmitting}
                        error={!!errors.periodPreferencesList?.[index]?.startPeriodId}
                    >
                        <InputLabel id={`period-select-label-${index}`}>Start Time</InputLabel>
                        <Select
                            labelId={`period-select-label-${index}`}
                            id={`period-select-${index}`}
                            {...control.register(`periodPreferencesList.${index}.startPeriodId`)}
                            label="Start Time *"
                            error={!!errors.periodPreferencesList?.[index]?.startPeriodId}
                        >
                            <MenuItem value="" disabled><em>Select Time</em></MenuItem>
                            {sortedPeriods.map((period: TimetablePeriod) => (
                                <MenuItem key={period.id} value={period.id}>
                                    {`${period.start} - ${period.end}`}
                                </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText
                            error={!!errors.periodPreferencesList?.[index]?.startPeriodId}>{errors.periodPreferencesList?.[index]?.startPeriodId?.message}
                        </FormHelperText>
                    </FormControl>

                    {/* Remove Occurrence Button */}
                    <IconButton
                        aria-label={`delete occurrence ${index + 1}`}
                        onClick={() => remove(index)}
                        color="error"
                        disabled={isSubmitting}
                        sx={{mt: {xs: 1, sm: 1}}}
                    >
                        <DeleteIcon/>
                    </IconButton>
                </Paper>
            ))}
        </>
    );
};
export default OccurrenceFormList;