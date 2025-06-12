import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import TimetableCreation from "./pages/TimetableCreation.tsx";
import TrackSelectionPage from "./pages/TrackSelectionPage.tsx";
import TimetableGridPage from "./pages/TimetableGridPage.tsx";
import EndofModulePage from "./pages/EndofModulePage.tsx";

// --- FEATURE FLAG ---
const isEndOfModuleEnabled =
  import.meta.env.VITE_FEATURE_END_OF_MODULE_ENABLED === "true";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="creation" element={<TimetableCreation />} />
        <Route path="selection" element={<TrackSelectionPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path={"table/:id"} element={<TimetableGridPage />} />
        {isEndOfModuleEnabled && (
          <Route
            path={"module-processing/:timetableId"}
            element={<EndofModulePage />}
          />
        )}
      </Route>
    </Routes>
  );
}

export default App;
