import React, {useState} from 'react';
import {Box, Button, CircularProgress, Stack, TextField} from '@mui/material';

interface CreateCohortFormProps {
    onSubmit: (name: string) => Promise<void>;
    isSubmitting: boolean;
}

const CreateCohortForm: React.FC<CreateCohortFormProps> = ({onSubmit, isSubmitting}) => {
    const [name, setName] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!name.trim()) return;
        await onSubmit(name);
        setName('');
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                    label="New Cohort Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    required
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting || !name.trim()}
                    sx={{minWidth: 120, height: 40}}
                >
                    {isSubmitting ? <CircularProgress size={24}/> : 'Add Cohort'}
                </Button>
            </Stack>
        </Box>
    );
};

export default CreateCohortForm;
