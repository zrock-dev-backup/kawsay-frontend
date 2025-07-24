import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import type { TimetableStructure } from "../../interfaces/timetableDtos";

interface TimetableSelectorProps {
  timetables: TimetableStructure[];
  activeId: string;
  onChange: (newId: string) => void;
}

export const TimetableSelector: React.FC<TimetableSelectorProps> = ({
  timetables,
  activeId,
  onChange,
}) => {
  return (
    <FormControl size="small" sx={{ minWidth: 250 }}>
      <InputLabel id="timetable-context-selector-label">
        View Context
      </InputLabel>
      <Select
        labelId="timetable-context-selector-label"
        value={activeId}
        label="View Context"
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="global">
          <Typography variant="body2" fontWeight="bold">
            Global Defaults
          </Typography>
        </MenuItem>
        {timetables.map((tt) => (
          <MenuItem key={tt.id} value={tt.id.toString()}>
            {tt.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
