import {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import type {Course, Teacher, TimetableStructure} from '../../interfaces/apiDataTypes';
import type {CohortDetailDto} from '../../interfaces/academicStructureDtos';
import type {ClassType, CreateClassRequest} from '../../interfaces/classDtos';
import {createClass, fetchCourses, fetchTimetableStructureById} from '../../services/apiService';
import {getQualifiedTeachersForCourse} from '../../services/courseApi';
import {getClassTypeDefaults} from '../../services/configurationApi';
import dayjs from "dayjs";

interface WizardState {
    isLoading: boolean;
    isSubmitting: boolean;
    fetchError: string | null;
    submitStatus: { type: 'success' | 'error'; message: string } | null;

    step: number;

    timetableStructure: TimetableStructure | null;
    allCourses: Course[];
    academicStructure: CohortDetailDto[];
    classTypeConfigs: Map<ClassType, { defaultLength: number }>;

    qualifiedTeachers: Teacher[];

    form: Omit<CreateClassRequest, 'timetableId'>;
}

const getInitialFormState = (): Omit<CreateClassRequest, 'timetableId'> => ({
    courseId: 0,
    teacherId: 0,
    length: 1,
    frequency: 1,
    classType: 'Masterclass',
    startDate: null,
    endDate: null,
    periodPreferences: [],
});

export function useClassCreationWizard() {
    const {timetableId} = useParams<{ timetableId: string }>();

    const [state, setState] = useState<WizardState>({
        isLoading: true,
        isSubmitting: false,
        fetchError: null,
        submitStatus: null,
        step: 0,
        timetableStructure: null,
        allCourses: [],
        academicStructure: [],
        classTypeConfigs: new Map(),
        qualifiedTeachers: [],
        form: getInitialFormState(),
    });

    useEffect(() => {
        if (!timetableId) {
            setState(prev => ({...prev, isLoading: false, fetchError: "Timetable ID is missing from URL."}));
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
                configs.forEach(c => configMap.set(c.classType, {defaultLength: c.defaultLength}));

                setState(prev => ({
                    ...prev,
                    timetableStructure: structure,
                    allCourses: courses,
                    classTypeConfigs: configMap,
                    isLoading: false,
                }));
            } catch (err) {
                const message = err instanceof Error ? err.message : "An unknown error occurred.";
                setState(prev => ({...prev, isLoading: false, fetchError: message}));
            }
        };

        loadInitialData();
    }, [timetableId]);

    const initializeWizard = useCallback((classType: ClassType) => {
        const classConfig = state.classTypeConfigs.get(classType);
        const timetableStart = state.timetableStructure?.startDate ? dayjs(state.timetableStructure.startDate) : dayjs();

        setState(prev => ({
            ...prev,
            form: {
                ...getInitialFormState(),
                classType: classType,
                length: classConfig?.defaultLength ?? 1,
                startDate: timetableStart,
                endDate: timetableStart.add(8, 'week'),
            }
        }));
    }, [state.classTypeConfigs, state.timetableStructure]);

    const setFormValue = useCallback(<K extends keyof WizardState['form']>(key: K, value: WizardState['form'][K]) => {
        setState(prev => ({
            ...prev,
            form: {...prev.form, [key]: value}
        }));
    }, []);

    const handleCourseSelect = useCallback(async (courseId: number | null) => {
        setFormValue('courseId', courseId ?? 0);
        setFormValue('teacherId', 0); // Reset teacher selection
        if (!courseId) {
            setState(prev => ({...prev, qualifiedTeachers: []}));
            return;
        }
        try {
            const teachers = await getQualifiedTeachersForCourse(courseId);
            setState(prev => ({...prev, qualifiedTeachers: teachers}));
        } catch (err) {
            console.error("Failed to fetch qualified teachers", err);
        }
    }, [setFormValue]);

    const handleStep = (direction: 'next' | 'back') => {
        setState(prev => ({...prev, step: prev.step + (direction === 'next' ? 1 : -1)}));
    };

    const handleSubmit = async () => {
        if (!timetableId) return;

        setState(prev => ({...prev, isSubmitting: true, submitStatus: null}));

        const payload: CreateClassRequest = {
            ...state.form,
            timetableId: Number(timetableId),
            startDate: state.form.startDate ? state.form.startDate.format('YYYY-MM-DD') : null,
            endDate: state.form.endDate ? state.form.endDate.format('YYYY-MM-DD') : null,
        };

        try {
            const result = await createClass(payload);
            setState(prev => ({
                ...prev,
                isSubmitting: false,
                submitStatus: {type: 'success', message: `Class "${result.courseDto.name}" created successfully!`},
                step: 0, // Reset to first step
                form: {
                    ...getInitialFormState(),
                    classType: prev.form.classType, // Keep the same class type for the next creation
                }
            }));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to create class.";
            setState(prev => ({...prev, isSubmitting: false, submitStatus: {type: 'error', message}}));
        }
    };

    return {
        state,
        timetableId,
        initializeWizard,
        setFormValue,
        handleCourseSelect,
        handleStep,
        handleSubmit,
    };
}
