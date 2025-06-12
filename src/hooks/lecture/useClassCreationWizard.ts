import {useCallback, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import type {Course, Teacher, TimetableStructure} from '../../interfaces/apiDataTypes';
import type {CohortDetailDto} from '../../interfaces/academicStructureDtos';
import type {ClassType} from '../../interfaces/classDtos';
import {fetchCourses, fetchTimetableStructureById} from '../../services/apiService';
import {fetchCohortsForTimetable} from '../../services/academicStructureApi';
import {getQualifiedTeachersForCourse} from '../../services/courseApi';
import {getClassTypeDefaults} from '../../services/configurationApi';

interface WizardState {
    isLoading: boolean;
    fetchError: string | null;

    timetableStructure: TimetableStructure | null;
    allCourses: Course[];
    academicStructure: CohortDetailDto[];
    classTypeConfigs: Map<ClassType, { defaultLength: number }>;

    selectedClassType: ClassType | null;
    selectedCourseId: number | null;
    qualifiedTeachers: Teacher[];
}

const initialState: WizardState = {
    isLoading: true,
    fetchError: null,
    timetableStructure: null,
    allCourses: [],
    academicStructure: [],
    classTypeConfigs: new Map(),
    selectedClassType: null,
    selectedCourseId: null,
    qualifiedTeachers: [],
};

export function useClassCreationWizard() {
    const {timetableId} = useParams<{ timetableId: string }>();
    const [state, setState] = useState<WizardState>(initialState);

    useEffect(() => {
        if (!timetableId) {
            setState(prev => ({...prev, isLoading: false, fetchError: "Timetable ID is missing from URL."}));
            return;
        }

        const loadInitialData = async () => {
            try {
                const [structure, courses, cohorts, configs] = await Promise.all([
                    fetchTimetableStructureById(timetableId),
                    fetchCourses(),
                    fetchCohortsForTimetable(timetableId),
                    getClassTypeDefaults(),
                ]);

                const configMap = new Map<ClassType, { defaultLength: number }>();
                configs.forEach(c => configMap.set(c.classType, {defaultLength: c.defaultLength}));

                setState(prev => ({
                    ...prev,
                    timetableStructure: structure,
                    allCourses: courses,
                    academicStructure: cohorts,
                    classTypeConfigs: configMap,
                    isLoading: false,
                }));
            } catch (err) {
                const message = err instanceof Error ? err.message : "An unknown error occurred during data fetch.";
                setState(prev => ({...prev, isLoading: false, fetchError: message}));
            }
        };

        loadInitialData();
    }, [timetableId]);

    const initializeWizard = useCallback((classType: ClassType) => {
        setState(prev => ({
            ...prev,
            selectedClassType: classType,
        }));
    }, []);

    const handleCourseSelect = useCallback(async (courseId: number | null) => {
        if (!courseId) {
            setState(prev => ({...prev, selectedCourseId: null, qualifiedTeachers: []}));
            return;
        }
        setState(prev => ({...prev, selectedCourseId: courseId, qualifiedTeachers: []}));

        try {
            const teachers = await getQualifiedTeachersForCourse(courseId);
            setState(prev => ({...prev, qualifiedTeachers: teachers}));
        } catch (err) {
            console.error("Failed to fetch qualified teachers", err);
        }

    }, []);

    return {
        state,
        initializeWizard,
        handleCourseSelect,
    };
}
