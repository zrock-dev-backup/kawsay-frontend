// src/App.tsx

import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import TimetableCreation from "./pages/TimetableCreation.tsx";
import TrackSelectionPage from "./pages/TrackSelectionPage.tsx";
import TimetableGridPage from "./pages/TimetableGridPage.tsx";
// Import the new Class Creation Page
import ClassCreationPage from "./pages/ClassCreationPage.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="creation" element={<TimetableCreation />} />
                <Route path="selection" element={<TrackSelectionPage />} />
                <Route path="*" element={<NotFoundPage />} />
                {/* Route for Timetable Grid */}
                <Route path={"table/:id"} element={<TimetableGridPage />} />
                {/* New Route for Class Creation, nested under timetable ID */}
                <Route path={"table/:timetableId/create-class"} element={<ClassCreationPage />} />
                {/* Remove any route referencing LessonEditPage */}
            </Route>
        </Routes>
    );
}

export default App;
