import React, {useState} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup
} from '@mui/material';
import type {ClassType} from '../../interfaces/classDtos.ts';

interface Props {
    open: boolean;
    onClose: () => void;
    onContinue: (selectedType: ClassType) => void;
}

export const ClassTypeSelectionModal: React.FC<Props> = ({open, onClose, onContinue}) => {
    const [value, setValue] = useState<ClassType>('Masterclass');

    const handleContinue = () => {
        onContinue(value);
    };

    return (
        <Dialog open={open} onClose={onClose} disableEscapeKeyDown>
            <DialogTitle>Select Class Type</DialogTitle>
            <DialogContent>
                <FormControl component="fieldset" sx={{mt: 1}}>
                    <FormLabel component="legend">What type of class do you want to create?</FormLabel>
                    <RadioGroup
                        aria-label="class-type"
                        name="class-type-group"
                        value={value}
                        onChange={(e) => setValue(e.target.value as ClassType)}
                    >
                        <FormControlLabel value="Masterclass" control={<Radio/>} label="Masterclass"/>
                        <FormControlLabel value="Lab" control={<Radio/>} label="Lab"/>
                    </RadioGroup>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleContinue} variant="contained">Continue</Button>
            </DialogActions>
        </Dialog>
    );
};
