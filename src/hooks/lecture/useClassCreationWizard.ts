import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import type {
  Course,
  Teacher,
  TimetableStructure,
} from "../../interfaces/apiDataTypes";
import type { ClassFormState, ClassType } from "../../interfaces/classDtos";
import {
  createClass,
  fetchClassById,
  updateClass,
} from "../../services/apiClassService.ts";
import {
  fetchCourses,
  fetchTimetableStructureById,
} from "../../services/apiService.ts";
import { getQualifiedTeachersForCourse } from "../../services/courseApi";
import { getClassTypeDefaults } from "../../services/configurationApi";
import type { ClassTypeConfigurationDto } from "../../interfaces/configurationDtos.ts";

interface WizardState {
  isLoading: boolean;
  isSubmitting: boolean;
  fetchError: string | null;
  submitStatus: { type: "success" | "error"; message: string } | null;
  step: number;
  timetableStructure: TimetableStructure | null;
  allCourses: Course[];
  classTypeConfigs: Map<ClassType, ClassTypeConfigurationDto>;
  qualifiedTeachers: Teacher[];
  form: ClassFormState;
  validationErrors: Partial<Record<keyof ClassFormState, string>>;
}

const getInitialFormState = (
  timetableId: number,
  classType: ClassType,
): ClassFormState => ({
  id: null,
  timetableId: timetableId,
  courseId: null,
  teacherId: null,
  length: 1,
  frequency: 1,
  classType: classType,
  startDate: null,
  endDate: null,
  periodPreferences: [],
});

export function useClassCreationWizard(timetableId: string) {
  const [state, setState] = useState<WizardState>({
    isLoading: true,
    isSubmitting: false,
    fetchError: null,
    submitStatus: null,
    step: 0,
    timetableStructure: null,
    allCourses: [],
    classTypeConfigs: new Map(),
    qualifiedTeachers: [],
    form: getInitialFormState(Number(timetableId), "Masterclass"),
    validationErrors: {},
  });

  useEffect(() => {
    if (!timetableId) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        fetchError: "Timetable ID is missing from URL.",
      }));
      return;
    }

    const loadInitialData = async () => {
      try {
        const [structure, courses, configs] = await Promise.all([
          fetchTimetableStructureById(timetableId),
          fetchCourses(),
          getClassTypeDefaults(),
        ]);
        const configMap = new Map<ClassType, { defaultLength: number }>();
        configs.forEach((c) =>
          configMap.set(c.classType, { defaultLength: c.defaultLength }),
        );
        setState((prev) => ({
          ...prev,
          timetableStructure: structure,
          allCourses: courses,
          classTypeConfigs: configMap,
          isLoading: false,
        }));
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An unknown error occurred.";
        setState((prev) => ({
          ...prev,
          isLoading: false,
          fetchError: message,
        }));
      }
    };

    loadInitialData();
  }, [timetableId]);

  const setFormValue = useCallback(
    <K extends keyof ClassFormState>(key: K, value: ClassFormState[K]) => {
      setState((prev) => ({
        ...prev,
        form: { ...prev.form, [key]: value },
        validationErrors: { ...prev.validationErrors, [key]: undefined },
      }));
    },
    [],
  );

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ClassFormState, string>> = {};
    const { form } = state;
    if (!form.courseId) errors.courseId = "Please select a course.";
    if (!form.teacherId) errors.teacherId = "Please select a teacher.";
    if (!form.length || form.length <= 0)
      errors.length = "Length must be greater than 0.";
    if (!form.frequency || form.frequency <= 0)
      errors.frequency = "Frequency must be at least 1.";

    setState((prev) => ({ ...prev, validationErrors: errors }));
    return Object.keys(errors).length === 0;
  };

  const initializeForMode = useCallback(
    async (classId: number | null, classType: ClassType) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        submitStatus: null,
        validationErrors: {},
      }));
      const formDefaults = getInitialFormState(Number(timetableId), classType);

      if (classId) {
        // EDIT MODE
        try {
          const classToEdit = await fetchClassById(classId);
          const teachers = await getQualifiedTeachersForCourse(
            classToEdit.courseId,
          );
          setState((prev) => ({
            ...prev,
            qualifiedTeachers: teachers,
            form: {
              ...formDefaults,
              id: classToEdit.id,
              courseId: classToEdit.courseId,
              teacherId: classToEdit.teacherId,
              length: classToEdit.length,
              frequency: classToEdit.frequency,
              classType: classToEdit.classType,
              startDate: classToEdit.startDate
                ? dayjs(classToEdit.startDate)
                : null,
              endDate: classToEdit.endDate ? dayjs(classToEdit.endDate) : null,
              periodPreferences: classToEdit.periodPreferences || [],
            },
            isLoading: false,
          }));
        } catch (err) {
          setState((prev) => ({
            ...prev,
            fetchError: "Failed to load class data for editing.",
            isLoading: false,
          }));
        }
      } else {
        // CREATE MODE
        const classConfig = state.classTypeConfigs.get(classType);
        setState((prev) => ({
          ...prev,
          qualifiedTeachers: [],
          form: {
            ...formDefaults,
            length: classConfig?.defaultLength ?? 1,
            startDate: prev.timetableStructure
              ? dayjs(prev.timetableStructure.startDate)
              : null,
            endDate: prev.timetableStructure
              ? dayjs(prev.timetableStructure.startDate).add(8, "week")
              : null,
          },
          isLoading: false,
        }));
      }
    },
    [timetableId, state.classTypeConfigs],
  );

  const handleCourseSelect = useCallback(
    async (courseId: number | null) => {
      setFormValue("courseId", courseId);
      setFormValue("teacherId", null);
      if (!courseId) {
        setState((prev) => ({ ...prev, qualifiedTeachers: [] }));
        return;
      }
      try {
        const teachers = await getQualifiedTeachersForCourse(courseId);
        setState((prev) => ({ ...prev, qualifiedTeachers: teachers }));
      } catch (err) {
        console.error("Failed to fetch qualified teachers", err);
      }
    },
    [setFormValue],
  );

  const handleStep = (direction: "next" | "back") => {
    setState((prev) => ({
      ...prev,
      step: prev.step + (direction === "next" ? 1 : -1),
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setState((prev) => ({ ...prev, isSubmitting: true, submitStatus: null }));

    const { id, ...requestData } = state.form;

    try {
      const apiCall = id
        ? updateClass(id, requestData)
        : createClass(requestData);
      const result = await apiCall;
      const message = id
        ? `Class "${result.courseName}" updated.`
        : `Class "${result.courseName}" created.`;
      setState((prev) => ({
        ...prev,
        submitStatus: { type: "success", message },
      }));
      return true; // Signal success to parent
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setState((prev) => ({
        ...prev,
        submitStatus: { type: "error", message },
      }));
      return false;
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    state,
    initializeForMode,
    setFormValue,
    handleCourseSelect,
    handleStep,
    handleSubmit,
  };
}
