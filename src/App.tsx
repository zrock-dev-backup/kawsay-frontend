import {Route, Routes} from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import TimetableCreation from "./pages/TimetableCreation.tsx";
import TrackSelectionPage from "./pages/TrackSelectionPage.tsx";
import TimetableGridPage from "./pages/TimetableGridPage.tsx";
import ClassCreationPage from "./pages/ClassCreationPage.tsx";
import EndofModulePage from "./pages/EndofModulePage.tsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Layout/>}>
                <Route index element={<HomePage/>}/>
                <Route path="creation" element={<TimetableCreation/>}/>
                <Route path="selection" element={<TrackSelectionPage/>}/>
                <Route path="*" element={<NotFoundPage/>}/>
                <Route path={"table/:id"} element={<TimetableGridPage/>}/>
                <Route path={"table/:timetableId/create-class"} element={<ClassCreationPage/>}/>
                <Route path={"module-processing/:timetableId"} element={<EndofModulePage/>}/>
            </Route>
        </Routes>
    );
}

export default App;
