// src/services/apiService.ts

import type {
    Course,
    Teacher,
    TimetableStructure,
    CreateTimetableRequest,
    Class,
    CreateClassRequest,
    // UpdateClassRequest // Removed as update is not included
} from '../interfaces/apiDataTypes';

// Assuming VITE_API_BASE_URL is like "http://localhost:5000"
// The new API base is /kawsay
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/kawsay`;

if (!import.meta.env.VITE_API_BASE_URL) {
    console.error("CRITICAL ERROR: VITE_API_BASE_URL is not defined in your .env file.");
    throw new Error("API Base URL not configured. Define VITE_API_BASE_URL in .env");
}

// Helper function to handle API responses, including error parsing
async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            // Attempt to parse error details from the response body
            const errorBody = await response.json();
            // Use a specific message if available, otherwise fall back to common fields or status text
            errorMessage = errorBody?.message || errorBody?.error || errorBody?.title || errorMessage;
        } catch (e) {
            // If JSON parsing fails, just use the status text
            console.warn(`Failed to parse error response body for ${response.url}`, e);
        }
        console.error("API Error Response:", { status: response.status, statusText: response.statusText, url: response.url, errorMessage });
        throw new Error(errorMessage);
    }

    // Check content type before attempting to parse JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        // Return null if the body is empty but content type is json (e.g., 204 No Content with headers)
        return text ? JSON.parse(text) as T : null as T;
    } else if (response.status === 204) {
        // Handle No Content response explicitly
        return null as T;
    }
    else {
       // Handle other content types or empty responses
       console.warn(`Received non-JSON response for ${response.url}, Content-Type: ${contentType}`);
       return null as T; // Or handle based on expected non-JSON data
    }
}

// --- Basic Entity Fetching ---

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

// --- Timetable Endpoints ---

// Assuming an endpoint to list all timetables exists based on discussion
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
    // The new API returns the created TimetableStructure on success (201)
    return handleResponse<TimetableStructure>(response);
};

export const fetchTimetableStructureById = async (id: string | number): Promise<TimetableStructure> => {
    console.log(`Fetching timetable structure by ID ${id} from ${API_BASE_URL}/timetable/${id}`);
    const response = await fetch(`${API_BASE_URL}/timetable/${id}`);
    return handleResponse<TimetableStructure>(response);
};

// --- Class Endpoints ---

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
    // The new API returns the created Class on success (201)
    return handleResponse<Class>(response);
};

// --- Removed functions: updateClass, deleteClass ---
// These are not included in this version's scope.
