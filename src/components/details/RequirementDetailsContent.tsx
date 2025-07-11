import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import type { CourseRequirementDto } from "../../interfaces/courseRequirementDtos";

interface Props {
  requirement: CourseRequirementDto;
}

const DetailItem: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <Box>
    <Typography variant="caption" color="text.secondary" fontWeight={600}>
      {label}
    </Typography>
    <Box mt={0.5}>{children}</Box>
  </Box>
);

export const RequirementDetailsContent: React.FC<Props> = ({ requirement }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <Stack spacing={2.5}>
      <DetailItem label="Course">
        <Typography variant="h6">{requirement.courseName}</Typography>
      </DetailItem>

      <DetailItem label="Student Group">
        <Typography>{requirement.studentGroupName}</Typography>
      </DetailItem>

      <Stack direction="row" spacing={3}>
        <DetailItem label="Class Type">
          <Typography>{requirement.classType}</Typography>
        </DetailItem>
        <DetailItem label="Priority">
          <Chip
            label={requirement.priority}
            color={getPriorityColor(requirement.priority)}
            size="small"
            variant="outlined"
          />
        </DetailItem>
      </Stack>

      <Stack direction="row" spacing={3}>
        <DetailItem label="Frequency">
          <Typography>{requirement.frequency} times/week</Typography>
        </DetailItem>
        <DetailItem label="Duration">
          <Typography>
            {requirement.length} period{requirement.length !== 1 ? "s" : ""}
          </Typography>
        </DetailItem>
      </Stack>

      <DetailItem label="Term Period">
        <Typography>
          {dayjs(requirement.startDate).format("MMM D, YYYY")} to{" "}
          {dayjs(requirement.endDate).format("MMM D, YYYY")}
        </Typography>
      </DetailItem>

      <DetailItem label="Scheduling Preferences">
        {requirement.schedulingPreferences.length > 0 ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {requirement.schedulingPreferences.map((p, index) => (
              <Chip
                key={`${p.dayId}-${p.startPeriodId}-${index}`}
                label={`Day ${p.dayId}, Period ${p.startPeriodId}`}
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" fontStyle="italic">
            None specified
          </Typography>
        )}
      </DetailItem>
    </Stack>
  );
};
