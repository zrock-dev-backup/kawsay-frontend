import React from "react";
import { Grid, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useClassCreationWizard } from "../../hooks/lecture/useClassCreationWizard.ts";
import SlotPicker from "../lecture/SlotPicker.tsx";

interface Props {
  wizard: ReturnType<typeof useClassCreationWizard>;
}

export const Step2_SetSchedule: React.FC<Props> = ({ wizard }) => {
  const { state, setFormValue } = wizard;
  const { form, timetableStructure, validationErrors } = state;

  const sortedPeriods = React.useMemo(() => {
    if (!timetableStructure?.periods) return [];
    return [...timetableStructure.periods].sort((a, b) =>
      a.start.localeCompare(b.start),
    );
  }, [timetableStructure?.periods]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Periods Length"
            type="number"
            required
            fullWidth
            value={form.length}
            onChange={(e) => setFormValue("length", Number(e.target.value))}
            InputProps={{ inputProps: { min: 1 } }}
            error={!!validationErrors.length}
            helperText={validationErrors.length}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Frequency (per week)"
            type="number"
            required
            fullWidth
            value={form.frequency}
            onChange={(e) => setFormValue("frequency", Number(e.target.value))}
            InputProps={{ inputProps: { min: 1 } }}
            error={!!validationErrors.frequency}
            helperText={validationErrors.frequency}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePicker
            label="Class Start Date (Optional)"
            value={form.startDate}
            onChange={(newValue: Dayjs | null) =>
              setFormValue("startDate", newValue)
            }
            minDate={dayjs(timetableStructure?.startDate)}
            maxDate={dayjs(timetableStructure?.endDate)}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <DatePicker
            label="Class End Date (Optional)"
            value={form.endDate}
            onChange={(newValue: Dayjs | null) =>
              setFormValue("endDate", newValue)
            }
            minDate={form.startDate ?? dayjs(timetableStructure?.startDate)}
            maxDate={dayjs(timetableStructure?.endDate)}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <SlotPicker
            days={timetableStructure?.days ?? []}
            periods={sortedPeriods}
            length={form.length}
            value={form.periodPreferences}
            onChange={(newValue) => setFormValue("periodPreferences", newValue)}
          />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};
