import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
} from "../interfaces/courseRequirementDtos.ts";
import dayjs from "dayjs";

// --- MOCKED DATABASE ---
let requirements: CourseRequirementDto[] = [
  {
    id: 1,
    timetableId: 1,
    courseId: 1,
    courseName: "Advanced Software Engineering",
    studentGroupId: 101,
    studentGroupName: "Fall 2025 - Group A",
    classType: "Masterclass",
    length: 2,
    frequency: 2,
    priority: "High",
    requiredTeacherId: null,
    startDate: dayjs().add(1, "week").format("YYYY-MM-DD"),
    endDate: dayjs().add(9, "week").format("YYYY-MM-DD"),
    schedulingPreferences: [{ dayId: 1, startPeriodId: 2 }],
  },
];
let nextId = 2;
// --- END MOCKED DATABASE ---

// Simulates network delay
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchRequirements = async (
  timetableId: number,
): Promise<CourseRequirementDto[]> => {
  console.log(
    `[Mock API] Fetching requirements for timetableId: ${timetableId}`,
  );
  await sleep(500);
  return requirements.filter((r) => r.timetableId === timetableId);
};

export const createRequirement = async (
  data: CreateCourseRequirementRequest,
): Promise<CourseRequirementDto> => {
  console.log("[Mock API] Creating requirement:", data);
  await sleep(750);

  const newRequirement: CourseRequirementDto = {
    ...data,
    id: nextId++,
    courseName: `Course ID: ${data.courseId}`,
    studentGroupName: `Group ID: ${data.studentGroupId}`,
  };

  requirements.push(newRequirement);
  return newRequirement;
};

export const updateRequirement = async (
  id: number,
  data: Partial<CreateCourseRequirementRequest>,
): Promise<CourseRequirementDto> => {
  console.log(`[Mock API] Updating requirement ${id} with:`, data);
  await sleep(600);

  const reqIndex = requirements.findIndex((r) => r.id === id);
  if (reqIndex === -1) {
    throw new Error("Requirement not found");
  }

  // In a real API, course/group names would be re-verified.
  const updatedRequirement = {
    ...requirements[reqIndex],
    ...data,
  };

  requirements[reqIndex] = updatedRequirement;
  return updatedRequirement;
};

export const deleteRequirement = async (id: number): Promise<void> => {
  console.log(`[Mock API] Deleting requirement ${id}`);
  await sleep(500);

  const reqIndex = requirements.findIndex((r) => r.id === id);
  if (reqIndex === -1) {
    console.warn(`Requirement with id ${id} not found for deletion.`);
    return;
  }

  requirements.splice(reqIndex, 1);
};
