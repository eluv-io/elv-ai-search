import {Navigate, Route, Routes} from "react-router-dom";
import Search from "@/pages/search/Search.jsx";
import Create from "@/pages/create/Create.jsx";
import Library from "@/pages/library/Library.jsx";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate replace to="/search" />} />
      <Route path="/search" element={<Search />} />
      <Route path="/create" element={<Create />} />
      <Route path="/library" element={<Library />} />
    </Routes>
  );
};

export default AppRoutes;

