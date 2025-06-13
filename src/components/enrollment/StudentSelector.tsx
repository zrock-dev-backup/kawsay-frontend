import React, {useState} from "react";
import { List, ListItemButton, ListItemText, TextField } from "@mui/material";
import type { StudentDto } from "../../interfaces/apiDataTypes.ts";

interface Props {
  students: StudentDto[];
  selectedStudentId: number | null;
  onSelect: (student: StudentDto | null) => void;
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
        sx={{ mb: 2 }}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <List component="nav" dense>
        {filteredStudents.map((student) => (
          <ListItemButton
            key={student.id}
            selected={selectedStudentId === student.id}
            onClick={() => onSelect(student)}
          >
            <ListItemText
              primary={student.name}
              secondary={`ID: ${student.id}`}
            />
          </ListItemButton>
        ))}
      </List>
    </>
  );
};
export default StudentSelector;
