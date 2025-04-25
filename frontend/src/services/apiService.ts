
import type {
    Track,
    CreateTimetableRequest,
    ScheduleItemDto,
    LessonApiData
} from '../interfaces/apiDataTypes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("CRITICAL ERROR: VITE_API_BASE_URL is not defined in your .env file.");
    throw new Error("API Base URL not configured. Define VITE_API_BASE_URL in .env");
}

async function handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorBody = await response.json();
            errorMessage = errorBody?.message || errorBody?.title || errorMessage;
        } catch (e) { /* Ignore */ }
        console.error("API Error Response:", { status: response.status, statusText: response.statusText, url: response.url });
        throw new Error(errorMessage);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const text = await response.text();
        try {
           
            return text ? JSON.parse(text) as T : null as T;
        }
        catch (e) {
             console.warn(`Received JSON content type but failed to parse body for ${response.url}`);
             return null as T;
        }
    } else {
       
        return null as T;
    }
}



export const fetchTracks = async (): Promise<Track[]> => {
    console.log(`Fetching tracks from ${API_BASE_URL}/api/table/tracks`);
    const response = await fetch(`${API_BASE_URL}/api/table/tracks`);
    return handleResponse<Track[]>(response);
};

export const createTimetable = async (data: CreateTimetableRequest): Promise<{ message: string; trackId: number }> => {
    console.log(`Creating timetable at ${API_BASE_URL}/api/table/create`);
    const response = await fetch(`${API_BASE_URL}/api/table/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse<{ message: string; trackId: number }>(response);
};


export const fetchTimetableById = async (id: string): Promise<ScheduleItemDto[]> => {
    console.log(`Fetching timetable by ID ${id} from ${API_BASE_URL}/api/table/${id}`);
    const response = await fetch(`${API_BASE_URL}/api/table/${id}`);
    return handleResponse<ScheduleItemDto[]>(response);
};

export const fetchLessonById = async (lessonId: string): Promise<LessonApiData> => {
    console.log(`Fetching lesson by ID ${lessonId} from ${API_BASE_URL}/api/lesson/${lessonId}`);
    const response = await fetch(`${API_BASE_URL}/api/lesson/${lessonId}`);
    return handleResponse<LessonApiData>(response);
};

export const updateLesson = async (lessonId: string, data: LessonApiData): Promise<LessonApiData> => {
    console.log(`Updating lesson ID ${lessonId} at ${API_BASE_URL}/api/lesson/${lessonId}`);
    const response = await fetch(`${API_BASE_URL}/api/lesson/${lessonId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return handleResponse<LessonApiData>(response);
};
