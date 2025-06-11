import React from 'react';
import {Alert, Box, Button, CircularProgress, TextField, Typography} from '@mui/material';

interface GradeIngestionFormProps {
    csvData: string;
    onCsvDataChange: (data: string) => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    submitError: string | null;
}

const GradeIngestionForm: React.FC<GradeIngestionFormProps> = ({
                                                                   csvData,
                                                                   onCsvDataChange,
                                                                   onSubmit,
                                                                   isSubmitting,
                                                                   submitError,
                                                               }) => {
    return (
        <Box component="form" noValidate autoComplete="off">
            <Typography variant="body1" gutterBottom>
                Paste grade data here in CSV format (studentId,courseId,gradeValue).
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{mb: 2}}>
                Example:<br/>
                1,101,85.5<br/>
                1,102,92.0<br/>
                2,101,68.0
            </Typography>

            <TextField
                label="CSV Grade Data"
                multiline
                rows={8}
                fullWidth
                variant="outlined"
                value={csvData}
                onChange={(e) => onCsvDataChange(e.target.value)}
                disabled={isSubmitting}
                placeholder="Paste data here..."
            />

            {submitError && (
                <Alert severity="error" sx={{mt: 2}}>
                    {submitError}
                </Alert>
            )}

            <Button
                variant="contained"
                color="primary"
                onClick={onSubmit}
                disabled={isSubmitting || !csvData.trim()}
                sx={{mt: 2}}
            >
                {isSubmitting ? <CircularProgress size={24} color="inherit"/> : 'Ingest Grades'}
            </Button>
        </Box>
    );
};

export default GradeIngestionForm;
