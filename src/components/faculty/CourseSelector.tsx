import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Checkbox,
  CircularProgress,
  TextField,
} from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import type { Course } from "../../interfaces/apiDataTypes";
import { fetchCourseSummaries } from "../../services/courseApi";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface CourseSelectorProps {
  selectedCourses: Course[];
  onChange: (courses: Course[]) => void;
  disabled?: boolean;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  selectedCourses,
  onChange,
  disabled,
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<Course[]>([]);
  const loading = open && options.length === 0;

  useEffect(() => {
    let active = true;

    if (!loading) {
      return undefined;
    }

    (async () => {
      // This assumes a 'fetchCourses' function exists in one of your API services.
      // If not, it would need to be created, similar to `fetchTeachers`.
      const courses = await fetchCourseSummaries();
      if (active) {
        setOptions(courses);
      }
    })();

    return () => {
      active = false;
    };
  }, [loading]);

  useEffect(() => {
    if (!open) {
      setOptions([]);
    }
  }, [open]);

  return (
    <Autocomplete
      multiple
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      loading={loading}
      value={selectedCourses}
      onChange={(_, newValue) => onChange(newValue)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => `${option.name} (${option.code})`}
      disableCloseOnSelect
      disabled={disabled}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            icon={icon}
            checkedIcon={checkedIcon}
            style={{ marginRight: 8 }}
            checked={selected}
          />
          {`${option.name} (${option.code})`}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Qualifications"
          placeholder="Select courses"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
