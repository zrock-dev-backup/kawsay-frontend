import type {
    Course,
    Teacher,
    TimetableStructure,
    CreateTimetableRequest,
    Class,
    CreateClassRequest,
} from '../interfaces/apiDataTypes';

const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/kawsay`;
if (!import.meta.env.VITE_API_BASE_URL) {
    console.error("CRITICAL ERROR: VITE_API_BASE_URL is not defined in .env file.");
    throw new Error("API Base URL not configured. Define VITE_API_BASE_URL in .env");
}

interface GenerateScheduleResponse {
    message: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
    const url = response.url;
    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody?.message || errorBody?.error || errorBody?.title || errorMessage;
        } catch (e) {
            console.warn(`Failed to parse error response body for ${url}`, e);
        }
        console.error("API Error Response:", {
            status: response.status,
            statusText: response.statusText,
            url: url,
            errorMessage
        });
        throw new Error(errorMessage);
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        try {
            return text ? JSON.parse(text) as T : null as T;
        } catch (e) {
            console.warn(`Failed to parse seemingly JSON response for ${url}`, e);
            return null as T;
        }
    } else if (response.status === 204) {
        return null as T;
    } else {
        console.log(`Received non-JSON OK response for ${url}, Status: ${response.status}, Content-Type: ${contentType}`);
        return null as T;
    }
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
