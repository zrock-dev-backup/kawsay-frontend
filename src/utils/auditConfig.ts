import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

export const AUDIT_STATUS_CONFIG = {
  ReadyToEnroll: {
    label: "Ready to Enroll",
    icon: CheckCircleIcon,
    color: "success" as const,
    actionLabel: "View Details",
    selectable: true,
  },
  ActionRequired: {
    label: "Action Required",
    icon: WarningIcon,
    color: "warning" as const,
    actionLabel: "Resolve Issues",
    selectable: false,
  },
  Enrolled: {
    label: "Enrolled",
    icon: TaskAltIcon,
    color: "info" as const,
    actionLabel: "View Details",
    selectable: false,
  },
} as const;

export const validateBulkEnrollment = (
  studentIds: number[],
  students: any[],
): string[] => {
  const errors: string[] = [];

  if (studentIds.length === 0) {
    errors.push("No students selected for enrollment");
  }

  const readyStudents = students.filter(
    (s) => studentIds.includes(s.studentId) && s.status === "ReadyToEnroll",
  );

  if (readyStudents.length !== studentIds.length) {
    errors.push("Some selected students are not ready for enrollment");
  }

  return errors;
};
