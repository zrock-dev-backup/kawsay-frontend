import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import NotFoundPage from "./pages/NotFoundPage";
import TimetableCreation from "./pages/TimetableCreation.tsx";
import TimetableGridPage from "./pages/TimetableGridPage.tsx";
import EndofModulePage from "./pages/EndofModulePage.tsx";
import StudentEnrollmentPage from "./pages/StudentEnrollmentPage.tsx";
import FacultyDirectoryPage from "./pages/FacultyDirectoryPage.tsx";
import TimetableDashboardPage from "./pages/TimetableDashboardPage.tsx";

// --- FEATURE FLAG ---
const isEndOfModuleEnabled =
  import.meta.env.VITE_FEATURE_END_OF_MODULE_ENABLED === "true";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TimetableDashboardPage />} />
        <Route path="creation" element={<TimetableCreation />} />
        <Route path="selection" element={<TimetableDashboardPage />} />
        <Route
          path="enrollment/:timetableId"
          element={<StudentEnrollmentPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
        <Route path={"table/:id"} element={<TimetableGridPage />} />
        {isEndOfModuleEnabled && (
          <Route
            path={"module-processing/:timetableId"}
            element={<EndofModulePage />}
          />
        )}
        <Route path="faculty" element={<FacultyDirectoryPage />} />
      </Route>
    </Routes>
  );
}

export default App;
