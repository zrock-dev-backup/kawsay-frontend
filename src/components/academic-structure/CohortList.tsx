import React from 'react';
import { List, ListItem, ListItemText, Typography, Divider, Paper } from '@mui/material';
import type { CohortDetailDto } from '../../interfaces/academicStructureDtos';

interface CohortListProps {
    cohorts: CohortDetailDto[];
}

const CohortList: React.FC<CohortListProps> = ({ cohorts }) => {
    if (cohorts.length === 0) {
        return <Typography sx={{ p: 2, color: 'text.secondary' }}>No cohorts have been created for this timetable yet.</Typography>;
    }

    return (
        <Paper variant="outlined">
            <List disablePadding>
                {cohorts.map((cohort, index) => (
                    <React.Fragment key={cohort.id}>
                        <ListItem>
                            <ListItemText
                                primary={cohort.name}
                                secondary={`ID: ${cohort.id} | Groups: ${cohort.studentGroups.length}`}
                            />
                        </ListItem>
                        {index < cohorts.length - 1 && <Divider />}
                    </React.Fragment>
                ))}
            </List>
        </Paper>
    );
};

export default CohortList;
