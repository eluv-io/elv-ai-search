import {Navigate, Route, Routes} from "react-router-dom";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/search" />} />
      <Route path="/search" element={null} />
      <Route path="/create" element={null} />
      <Route path="/library" element={null} />
    </Routes>
  );
};

export default AppRoutes;

