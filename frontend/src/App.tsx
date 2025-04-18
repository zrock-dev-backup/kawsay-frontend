import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import TimetableCreation from "./pages/TimetableCreation.tsx";
import TrackSelectionPage from "./pages/TrackSelectionPage.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="creation" element={<TimetableCreation />} />
                <Route path="selection" element={<TrackSelectionPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}

export default App;