import React, {useState} from 'react';
import {Box, Divider, List, ListItem, ListItemText, Typography} from '@mui/material';
import type {StudentGroupDetailDto} from '../../interfaces/academicStructureDtos';
import CreateSectionForm from './CreateSectionForm';

interface SectionManagerProps {
    group: StudentGroupDetailDto;
    cohortId: number;
    onAddSection: (cohortId: number, groupId: number, sectionName: string) => Promise<void>;
}

const SectionManager: React.FC<SectionManagerProps> = ({group, cohortId, onAddSection}) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateSection = async (name: string) => {
        setIsSubmitting(true);
        await onAddSection(cohortId, group.id, name);
        setIsSubmitting(false);
    };

    return (
        <Box sx={{width: '100%', pl: 4, pr: 2, py: 1, backgroundColor: 'action.hover', borderRadius: 1}}>
            <Typography variant="subtitle2" sx={{fontWeight: 'bold'}}>Sections</Typography>
            <Divider sx={{my: 1}}/>
            {group.sections.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{px: 1, pb: 1}}>
                    No sections created for this group yet.
                </Typography>
            ) : (
                <List dense>
                    {group.sections.map((section) => (
                        <ListItem key={section.id}>
                            <ListItemText primary={section.name}
                                          secondary={`ID: ${section.id} | Students: ${section.students.length}`}/>
                        </ListItem>
                    ))}
                </List>
            )}
            <CreateSectionForm onSubmit={handleCreateSection} isSubmitting={isSubmitting}/>
        </Box>
    );
};

export default SectionManager;
