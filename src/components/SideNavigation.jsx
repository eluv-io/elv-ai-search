import {useLocation, useNavigate} from "react-router-dom";
import {AppShell, NavLink} from "@mantine/core";
import {CreateIcon, LibraryIcon, SearchIcon} from "@/assets/icons/index.js";
import styles from "@/assets/modules/SideNavigation.module.css";

const NAV_LINKS = [
  {path: "/search", icon: <SearchIcon />, title: "Search"},
  {path: "/create", icon: <CreateIcon />, title: "Create"},
  {path: "/library", icon: <LibraryIcon />, title: "My Library"},
];

const SideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell.Navbar p="24 14">
      {
        NAV_LINKS.map(({path, icon, title}) => (
          <NavLink
            key={`navigation-link-${path}`}
            classNames={{section: styles.section}}
            href="#"
            onClick={() => navigate(path)}
            active={path === location.pathname}
            leftSection={icon}
            title={title}
          />
        ))
      }
    </AppShell.Navbar>
  );
};

export default SideNavigation;
