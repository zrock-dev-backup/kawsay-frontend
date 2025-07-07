import { useState, useEffect, useMemo } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  fetchCoursesForForm,
  getQualifiedTeachersForCourse,
} from "../../services/courseApi";
import {
  fetchCohortsForTimetableSummary,
  fetchGroupsForCohortSummary,
  fetchSectionsForGroupSummary,
} from "../../services/academicStructureApi";
import {
  runPreflightCheckForRequirement,
  PreflightCheckResult,
} from "../../services/courseRequirementsApi";
import { useCourseRequirementStore } from "../../stores/useCourseRequirementStore";
import { useTimetableStore } from "../../stores/useTimetableStore";

import type { Teacher } from "../../interfaces/apiDataTypes";
import type { ClassType } from "../../interfaces/classDtos";
import type {
  CourseRequirementDto,
  CreateCourseRequirementRequest,
} from "../../interfaces/courseRequirementDtos";
import type {
  CourseSummaryDto,
  SummaryDto,
} from "../../interfaces/formDataDtos";

// core data model form
type RequirementFormModel = Omit<
  CreateCourseRequirementRequest,
  "startDate" | "endDate"
> & {
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

// transient state used only for UI controls
interface FormUiState {
  cohortId: number | null;
  groupId: number | null;
}

export interface UseCourseRequirementFormProps {
  timetableId: number;
  requirementToEdit: CourseRequirementDto | null;
  onFormSuccess: () => void;
}

interface ConfirmationState {
  payload: CreateCourseRequirementRequest;
  checkResult: PreflightCheckResult;
}

const getInitialModel = (timetableId: number): RequirementFormModel => ({
  timetableId,
  courseId: null,
  studentGroupId: null,
  studentSectionId: null,
  classType: "Masterclass",
  length: 1,
  frequency: 1,
  priority: "Medium",
  requiredTeacherId: null,
  startDate: dayjs().add(1, "day"),
  endDate: dayjs().add(8, "week"),
  schedulingPreferences: [],
});

const getInitialUiState = (): FormUiState => ({
  cohortId: null,
  groupId: null,
});

export const useCourseRequirementForm = ({
  timetableId,
  requirementToEdit,
  onFormSuccess,
}: UseCourseRequirementFormProps) => {
  const { addRequirement, updateRequirement, isLoading: isStoreLoading } =
    useCourseRequirementStore();
  const { structure: timetableStructure } = useTimetableStore();

  const [formModel, setFormModel] = useState<RequirementFormModel>(
    getInitialModel(timetableId),
  );
  const [uiState, setUiState] = useState<FormUiState>(getInitialUiState());

  // Data states
  const [courses, setCourses] = useState<CourseSummaryDto[]>([]);
  const [cohorts, setCohorts] = useState<SummaryDto[]>([]);
  const [groups, setGroups] = useState<SummaryDto[]>([]);
  const [sections, setSections] = useState<SummaryDto[]>([]);
  const [qualifiedTeachers, setQualifiedTeachers] = useState<Teacher[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // UI states
  const [isChecking, setIsChecking] = useState(false);
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState | null>(null);

  const isEditMode = useMemo(() => requirementToEdit !== null, [requirementToEdit]);

  // --- Data Fetching Effects ---
  useEffect(() => {
    const loadInitialData = async () => {
      setIsDataLoading(true);
      setDataError(null);
      try {
        const [coursesData, cohortsData] = await Promise.all([
          fetchCoursesForForm(),
          fetchCohortsForTimetableSummary(timetableId),
        ]);
        setCourses(coursesData);
        setCohorts(cohortsData);
      } catch (error) {
        console.error("Failed to load form data", error);
        setDataError("Failed to load form data. Please try again.");
      } finally {
        setIsDataLoading(false);
      }
    };
    loadInitialData();
  }, [timetableId]);

  useEffect(() => {
    if (uiState.cohortId) {
      setGroups([]);
      setSections([]);
      fetchGroupsForCohortSummary(uiState.cohortId).then(setGroups).catch(console.error);
    } else {
      setGroups([]);
    }
  }, [uiState.cohortId]);

  useEffect(() => {
    if (uiState.groupId) {
      setSections([]);
      fetchSectionsForGroupSummary(uiState.groupId).then(setSections).catch(console.error);
    } else {
      setSections([]);
    }
  }, [uiState.groupId]);

  useEffect(() => {
    setQualifiedTeachers([]);
    handleModelChange("requiredTeacherId", null);
    if (formModel.courseId) {
      getQualifiedTeachersForCourse(formModel.courseId)
        .then(setQualifiedTeachers)
        .catch(console.error);
    }
  }, [formModel.courseId]);

  useEffect(() => {
    if (isEditMode && requirementToEdit) {
      setFormModel({
        ...requirementToEdit,
        startDate: dayjs(requirementToEdit.startDate),
        endDate: dayjs(requirementToEdit.endDate),
      });
      setUiState(getInitialUiState());
    } else if (!isEditMode) {
      setFormModel(getInitialModel(timetableId));
      setUiState(getInitialUiState());
    }
  }, [requirementToEdit, isEditMode, timetableId]);

  const sortedPeriods = useMemo(() => {
    if (!timetableStructure?.periods) return [];
    return [...timetableStructure.periods].sort((a, b) =>
      a.start.localeCompare(b.start),
    );
  }, [timetableStructure?.periods]);

  const isBusy = isStoreLoading || isChecking || isDataLoading;

  const isSubmitDisabled = useMemo(() => {
    if (isBusy || !formModel.courseId || !formModel.studentGroupId) return true;
    if (formModel.classType === 'Lab' && !formModel.studentSectionId) return true;
    return false;
  }, [isBusy, formModel]);

  const handleModelChange = (
    field: keyof RequirementFormModel,
    value: any,
  ) => {
    setFormModel((prev) => ({ ...prev, [field]: value }));
  };

  const handleUiChange = (field: keyof FormUiState, value: any) => {
    setUiState((prev) => ({ ...prev, [field]: value }));
  };

  const handleClassTypeChange = (newType: ClassType) => {
    setFormModel((prev) => ({
      ...prev,
      classType: newType,
      studentGroupId: null,
      studentSectionId: null,
    }));
    setUiState(getInitialUiState());
  };

  const modelToApiPayload = (model: RequirementFormModel): CreateCourseRequirementRequest => {
    if (!model.startDate || !model.endDate) {
      throw new Error("Start and End dates are required.");
    }
    return {
      ...model,
      startDate: model.startDate.format("YYYY-MM-DD"),
      endDate: model.endDate.format("YYYY-MM-DD"),
    };
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    const payload = modelToApiPayload(formModel);

    if (isEditMode && requirementToEdit) {
      const success = await updateRequirement(requirementToEdit.id, payload);
      if (success) onFormSuccess();
      return;
    }

    setIsChecking(true);
    try {
      const checkResult = await runPreflightCheckForRequirement(payload);
      if (checkResult.summary.issues === 0) {
        const success = await addRequirement(payload);
        if (success) onFormSuccess();
      } else {
        setConfirmationState({ payload, checkResult });
      }
    } catch (error) {
      console.error("Pre-flight check failed:", error);
      alert("Failed to check eligibility. Please try again.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleConfirmCreate = async () => {
    if (!confirmationState) return;
    const { payload, checkResult } = confirmationState;
    
    const finalPayload = {
      ...payload,
      ineligibleStudentIdsToFlag: checkResult.ineligibleStudentIds,
    };

    const success = await addRequirement(finalPayload);
    if (success) {
      onFormSuccess();
    }
    setConfirmationState(null);
  };

  const handleCancelConfirmation = () => {
    setConfirmationState(null);
  };

  return {
    formState: formModel,
    uiState,
    confirmationState,
    dataError,
    isEditMode,
    isBusy,
    isChecking,
    isSubmitDisabled,
    courses,
    cohorts,
    groups,
    sections,
    qualifiedTeachers,
    timetableStructure,
    sortedPeriods,

    actions: {
      handleSubmit,
      handleModelChange,
      handleUiChange,
      handleClassTypeChange,
      handleConfirmCreate,
      handleCancelConfirmation,
    },
  };
};
