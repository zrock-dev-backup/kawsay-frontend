import React, {useState} from "react";
import {Chip, List, ListItemButton, ListItemText, Stack, TextField} from "@mui/material";
import type { StudentDto } from "../../interfaces/apiDataTypes.ts";

interface Props {
  students: StudentDto[];
  selectedStudentId: number | null;
  onSelect: (student: StudentDto | null) => void;
}

const getStatusChip = (load: number) => {
    if (load >= 3) return null;
    if (load === 2) return <Chip label={`${load}/3`} color="warning" size="small" />;
    return <Chip label={`${load}/3`} color="error" size="small" />;
}

const StudentSelector: React.FC<Props> = ({
  students,
  selectedStudentId,
  onSelect,
}) => {
    const [filter, setFilter] = useState("");
    const filteredStudents = students.filter((s) =>
        s.name.toLowerCase().includes(filter.toLowerCase()),
    );

    return (
        <>
            <TextField
                label="Search Students"
                variant="outlined"
                fullWidth
                size="small"
                sx={{mb: 2}}
                value={filter}
                onChange={e => setFilter(e.target.value)}
            />
            <List component="nav" dense>
                {filteredStudents.map(student => (
                    <ListItemButton
                        key={student.id}
                        selected={selectedStudentId === student.id}
                        onClick={() => onSelect(student)}
                    >
                        <ListItemText primary={student.name} secondary={`ID: ${student.id}`}/>
                        <Stack direction="row" spacing={1}>
                            {getStatusChip(student.currentCourseLoad)}
                        </Stack>
                    </ListItemButton>
                ))}
            </List>
        </>
    );
}
export default StudentSelector;
