import {useLocation, useNavigate} from "react-router-dom";
import {AppShell, NavLink, Tooltip} from "@mantine/core";
import {CreateIcon, LibraryIcon, SearchIcon} from "@/assets/icons/index.js";
import styles from "@/components/side-navigation/SideNavigation.module.css";

const NAV_LINKS = [
  {path: "/search", icon: <SearchIcon />, title: "Search"},
  {path: "/create", icon: <CreateIcon />, title: "Create", disabled: true},
  {path: "/library", icon: <LibraryIcon />, title: "My Library", disabled: true},
];

const SideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell.Navbar p="24 14">
      {
        NAV_LINKS.map(({path, icon, title, disabled}) => (
          <Tooltip
            label={title}
            key={`navigation-link-${path}`}
            position="right"
            withArrow
          >
            <NavLink
              key={`navigation-link-${path}`}
              classNames={{section: styles.section}}
              href="#"
              onClick={() => navigate(path)}
              active={path === location.pathname}
              leftSection={icon}
              disabled={disabled}
            />
          </Tooltip>
        ))
      }
    </AppShell.Navbar>
  );
};

export default SideNavigation;
