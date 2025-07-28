import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import NotFoundPage from "./pages/NotFoundPage";
import TimetableCreation from "./pages/TimetableCreation.tsx";
import TimetableGridPage from "./pages/TimetableGridPage.tsx";
import EndofModulePage from "./pages/EndofModulePage.tsx";
import StudentEnrollmentPage from "./pages/StudentEnrollmentPage.tsx";
import TimetableDashboardPage from "./pages/TimetableDashboardPage.tsx";
import { FacultyRosterPage } from "./pages/FacultyRosterPage.tsx";
import SignInPage from "./pages/SignInPage.tsx";
import SignUpPage from "./pages/SignUpPage.tsx"; // Import the new page
import ProtectedRoute from "./components/common/ProtectedRoute.tsx";

// --- FEATURE FLAG ---
const isEndOfModuleEnabled =
  import.meta.env.VITE_FEATURE_END_OF_MODULE_ENABLED === "true";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} /> {/* Add this route */}

      {/* Protected Academic System Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<TimetableDashboardPage />} />
        <Route path="creation" element={<TimetableCreation />} />
        <Route path="selection" element={<TimetableDashboardPage />} />
        <Route
          path="enrollment/:timetableId"
          element={<StudentEnrollmentPage />}
        />
        <Route path="table/:id" element={<TimetableGridPage />} />
        {isEndOfModuleEnabled && (
          <Route
            path={"module-processing/:timetableId"}
            element={<EndofModulePage />}
          />
        )}
        <Route path="faculty" element={<FacultyRosterPage />} />
      </Route>

      {/* Catch-all Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
