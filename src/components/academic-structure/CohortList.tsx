import React from 'react';
import { List, ListItemButton, ListItemText, Typography, Paper } from '@mui/material';
import type { CohortDetailDto } from '../../interfaces/academicStructureDtos';

interface CohortListProps {
    cohorts: CohortDetailDto[];
    selectedCohortId: number | null;
    onSelectCohort: (id: number) => void;
}

const CohortList: React.FC<CohortListProps> = ({ cohorts, selectedCohortId, onSelectCohort }) => {
    if (cohorts.length === 0) {
        return (
            <Typography sx={{ p: 2, color: 'text.secondary' }}>
                No cohorts created yet.
            </Typography>
        );
    }

    return (
        <Paper variant="outlined">
            <List component="nav" dense disablePadding>
                {cohorts.map((cohort) => (
                    <ListItemButton
                        key={cohort.id}
                        selected={selectedCohortId === cohort.id}
                        onClick={() => onSelectCohort(cohort.id)}
                    >
                        <ListItemText
                            primary={cohort.name}
                            secondary={`Groups: ${cohort.studentGroups.length}`}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Paper>
    );
};

export default CohortList;
