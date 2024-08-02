import {AppShell, NavLink} from "@mantine/core";
import {CreateIcon} from "@/assets/icons/index.js";
import {useLocation, useNavigate} from "react-router-dom";

const NAV_LINKS = [
  {path: "/", label: "Test", icon: CreateIcon}
];

const SideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <AppShell.Navbar p="12 0">
      {
        NAV_LINKS.map(({path, label, icon}) => (
          <NavLink
            key={`navigation-link-${path}`}
            href="#"
            onClick={() => navigate(path)}
            label={label}
            leftSection={icon}
            active={path === location.pathname}
          />
        ))
      }
    </AppShell.Navbar>
  );
};

export default SideNavigation;
