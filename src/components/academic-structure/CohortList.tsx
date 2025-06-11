import React from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Box, Typography} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type {CohortDetailDto} from '../../interfaces/academicStructureDtos';
import StudentGroupManager from './StudentGroupManager';

interface CohortListProps {
    cohorts: CohortDetailDto[];
    onAddGroup: (cohortId: number, groupName: string) => Promise<void>;
}

const CohortList: React.FC<CohortListProps> = ({cohorts, onAddGroup}) => {
    if (cohorts.length === 0) {
        return <Typography sx={{p: 2, color: 'text.secondary'}}>No cohorts have been created for this timetable
            yet.</Typography>;
    }

    return (
        <Box>
            {cohorts.map((cohort) => (
                <Accordion key={cohort.id} TransitionProps={{unmountOnExit: true}}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls={`panel-${cohort.id}-content`}
                        id={`panel-${cohort.id}-header`}
                    >
                        <Typography sx={{width: '50%', flexShrink: 0}}>
                            {cohort.name}
                        </Typography>
                        <Typography sx={{color: 'text.secondary'}}>
                            {`ID: ${cohort.id} | Groups: ${cohort.studentGroups.length}`}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{p: 0}}>
                        <StudentGroupManager cohort={cohort} onAddGroup={onAddGroup}/>
                    </AccordionDetails>
                </Accordion>
            ))}
        </Box>
    );
};

export default CohortList;
