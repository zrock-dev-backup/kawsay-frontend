import React from "react";
import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TimetableAssignmentDto } from "../../interfaces/teacherDtos";

interface AssignedFacultyListProps {
  assignments: TimetableAssignmentDto[];
  onUnassign: (assignmentId: number) => void;
}

export const AssignedFacultyList: React.FC<AssignedFacultyListProps> = ({
  assignments,
  onUnassign,
}) => {
  if (assignments.length === 0) {
    return (
      <Typography sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
        No faculty assigned yet.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Contract</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {assignments.map((asm) => (
            <TableRow key={asm.assignmentId}>
              <TableCell>{asm.teacherFullName}</TableCell>
              <TableCell>
                {`${asm.maximumWorkload} ${asm.workloadUnit} (W${asm.startWeek}-W${asm.endWeek})`}
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Un-assign from Timetable">
                  <IconButton
                    onClick={() => onUnassign(asm.assignmentId)}
                    size="small"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
