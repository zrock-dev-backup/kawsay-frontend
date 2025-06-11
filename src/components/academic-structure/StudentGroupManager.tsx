import React, {useState} from 'react';
import {Box, Divider, List, ListItem, ListItemText, Typography} from '@mui/material';
import type {CohortDetailDto} from '../../interfaces/academicStructureDtos';
import CreateStudentGroupForm from './CreateStudentGroupForm';

interface StudentGroupManagerProps {
    cohort: CohortDetailDto;
    onAddGroup: (cohortId: number, groupName: string) => Promise<void>;
}

const StudentGroupManager: React.FC<StudentGroupManagerProps> = ({cohort, onAddGroup}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleCreateGroup = async (name: string) => {
        setIsSubmitting(true);

        await onAddGroup(cohort.id, name);
        setIsSubmitting(false);
    };

    return (
        <Box sx={{width: '100%', pl: 4, pr: 2, py: 1}}>
            <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>Student Groups</Typography>
            <Divider sx={{my: 1}}/>
            {cohort.studentGroups.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{p: 1}}>
                    No student groups created for this cohort yet.
                </Typography>
            ) : (
                <List dense>
                    {cohort.studentGroups.map((group) => (
                        <ListItem key={group.id}>
                            <ListItemText primary={group.name}
                                          secondary={`ID: ${group.id} | Sections: ${group.sections.length}`}/>
                        </ListItem>
                    ))}
                </List>
            )}
            <CreateStudentGroupForm onSubmit={handleCreateGroup} isSubmitting={isSubmitting}/>
        </Box>
    );
};

export default StudentGroupManager;
