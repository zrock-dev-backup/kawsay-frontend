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
    // Store URL before potentially consuming the body
    const url = response.url;

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            // Attempt to parse error details from the response body
            const errorBody = await response.json();
            // Use a specific message if available, otherwise fall back to common fields or status text
            errorMessage = errorBody?.message || errorBody?.error || errorBody?.title || errorMessage;
        } catch (e) {
            // If JSON parsing fails, just use the status text
            console.warn(`Failed to parse error response body for ${url}`, e);
        }
        console.error("API Error Response:", { status: response.status, statusText: response.statusText, url: url, errorMessage });
        throw new Error(errorMessage);
    }

    // Check content type before attempting to parse JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        // Return null if the body is empty but content type is json (e.g., 204 No Content with headers)
        // Or if the response is OK but doesn't return JSON (which might happen for POST success without body)
        try {
            return text ? JSON.parse(text) as T : null as T;
        } catch (e) {
            console.warn(`Failed to parse seemingly JSON response for ${url}`, e);
             // Handle cases where content-type is json but body is not valid json (e.g., empty string on some successes)
             return null as T;
        }
    } else if (response.status === 204) {
        // Handle No Content response explicitly
        return null as T;
    } else {
       // Handle other content types or OK responses without JSON bodies
       console.log(`Received non-JSON OK response for ${url}, Status: ${response.status}, Content-Type: ${contentType}`);
       // For the generate endpoint, even if not JSON, success means the process started/finished.
       // We might need a more specific way to handle this, but returning a generic success object or null is okay for now.
       // Let's assume the backend *does* return JSON with a message on success/conflict as per the controller code.
       // If it just returns 200 OK with no body, the JSON parse above will fail, and we'll hit this returning null.
       // We might need to adjust the calling component to handle a null success response.
       // ---- Let's refine handleResponse slightly for the generate case ----
       // If response is OK but not JSON and not 204, maybe return a default success object if T allows?
       // Or better, let the caller handle null response as potential success if expected.
       return null as T;
    }
}

// --- Basic Entity Fetching ---
// ... (fetchCourses, fetchTeachers remain the same) ...
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
// ... (fetchTimetables, createTimetable, fetchTimetableStructureById remain the same) ...
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
// ... (fetchClassesForTimetable, fetchClassById, createClass remain the same) ...
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


// --- Scheduling Endpoint ---

// Define the expected response type (based on backend controller)
interface GenerateScheduleResponse {
    message: string;
}

export const generateScheduleForTimetable = async (timetableId: string | number): Promise<GenerateScheduleResponse> => {
    console.log(`Requesting schedule generation for timetable ID ${timetableId} at ${API_BASE_URL}/scheduling/generate/${timetableId}`);
    const response = await fetch(`${API_BASE_URL}/scheduling/generate/${timetableId}`, {
        method: 'POST',
        headers: {
            // No Content-Type needed for POST without body
            'Accept': 'application/json', // We expect a JSON response on success/error
        },
        // No body for this request
    });
     // Use handleResponse. It expects JSON, which the backend provides for Ok/Conflict/NotFound/BadRequest.
     // It will throw an error if the response is not ok (e.g., 404, 400, 500).
     // It will parse the JSON { message: "..." } on success (200 OK) or conflict (409).
    return handleResponse<GenerateScheduleResponse>(response);
};
