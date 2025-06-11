import {API_BASE_URL, handleResponse} from './api.helpers';
import type {
    BulkActionResponse,
    BulkAdvanceRequest,
    BulkRetakeRequest,
    Course,
    CreateTimetableRequest,
    GradeIngestionDto,
    StudentCohortDto,
    Teacher,
    TimetableStructure,
} from '../interfaces/apiDataTypes';

import type {Class, CreateClassRequest,} from '../interfaces/classDtos';


interface GenerateScheduleResponse {
    message: string;
}

export const fetchCourses = async (): Promise<Course[]> => {
    console.log(`Fetching courses from ${API_BASE_URL}/courses`);
    const response = await fetch(`${API_BASE_URL}/courses`);
    return handleResponse<Course[]>(response);
};

export const fetchTeachers = async (): Promise<Teacher[]> => {
    console.log(`Fetching teachers from ${API_BASE_URL}/teachers`);
    const response = await fetch(`${API_BASE_URL}/teachers`);
    return handleResponse<Teacher[]>(response);
};

export const fetchTimetables = async (): Promise<TimetableStructure[]> => {
    console.log(`Fetching timetables from ${API_BASE_URL}/timetables`);
    const response = await fetch(`${API_BASE_URL}/timetables`);
    return handleResponse<TimetableStructure[]>(response);
};

export const createTimetable = async (data: CreateTimetableRequest): Promise<TimetableStructure> => {
    console.log(`Creating timetable at ${API_BASE_URL}/timetable`, data);
    const response = await fetch(`${API_BASE_URL}/timetable`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse<TimetableStructure>(response);
};

export const fetchTimetableStructureById = async (id: string | number): Promise<TimetableStructure> => {
    console.log(`Fetching timetable structure by ID ${id} from ${API_BASE_URL}/timetable/${id}`);
    const response = await fetch(`${API_BASE_URL}/timetable/${id}`);
    return handleResponse<TimetableStructure>(response);
};

export const fetchClassesForTimetable = async (timetableId: string | number): Promise<Class[]> => {
    console.log(`Fetching classes for timetable ID ${timetableId} from ${API_BASE_URL}/classes?timetableId=${timetableId}`);
    const response = await fetch(`${API_BASE_URL}/classes?timetableId=${timetableId}`);
    return handleResponse<Class[]>(response);
};

export const fetchClassById = async (classId: string | number): Promise<Class> => {
    console.log(`Fetching class by ID ${classId} from ${API_BASE_URL}/class/${classId}`);
    const response = await fetch(`${API_BASE_URL}/class/${classId}`);
    return handleResponse<Class>(response);
};

export const createClass = async (data: CreateClassRequest): Promise<Class> => {
    console.log(`Creating class at ${API_BASE_URL}/class`, data);
    const response = await fetch(`${API_BASE_URL}/class`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse<Class>(response);
};

export const generateScheduleForTimetable = async (timetableId: string | number): Promise<GenerateScheduleResponse> => {
    console.log(`Requesting schedule generation for timetable ID ${timetableId} at ${API_BASE_URL}/scheduling/generate/${timetableId}`);
    const response = await fetch(`${API_BASE_URL}/scheduling/generate/${timetableId}`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
        },
    });
    return handleResponse<GenerateScheduleResponse>(response);
};

export const ingestGrades = async (timetableId: string | number, gradeData: GradeIngestionDto[]): Promise<{
    message: string
}> => {
    console.log(`Ingesting ${gradeData.length} grades for timetable ID ${timetableId}`);
    const response = await fetch(`${API_BASE_URL}/module-processing/${timetableId}/ingest-grades`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(gradeData),
    });
    return handleResponse<{ message: string }>(response);
};

export const getModuleCohorts = async (timetableId: string | number): Promise<StudentCohortDto> => {
    console.log(`Fetching cohorts for timetable ID ${timetableId}`);
    const response = await fetch(`${API_BASE_URL}/module-processing/${timetableId}/cohorts`);
    return handleResponse<StudentCohortDto>(response);
};

export const bulkAdvanceStudents = async (payload: BulkAdvanceRequest): Promise<BulkActionResponse> => {
    console.log(`Requesting bulk advancement for ${payload.studentIds.length} students.`);
    const response = await fetch(`${API_BASE_URL}/module-processing/bulk-advance`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', 'Accept': 'application/json',},
        body: JSON.stringify(payload),
    });
    return handleResponse<BulkActionResponse>(response);
};

export const bulkEnrollRetakes = async (payload: BulkRetakeRequest): Promise<BulkActionResponse> => {
    console.log(`Requesting bulk retake enrollment for ${payload.studentIds.length} students.`);
    const response = await fetch(`${API_BASE_URL}/module-processing/bulk-retake-enroll`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
    });
    return handleResponse<BulkActionResponse>(response);
};
