import {AppShell, MantineProvider} from "@mantine/core";
import MantineTheme from "@/assets/MantineTheme.js";
import {BrowserRouter} from "react-router-dom";
import SideNavigation from "@/components/SideNavigation.jsx";
import AppRoutes from "../Routes.jsx";

const App = () => {
  return (
    <MantineProvider withCssVariables theme={MantineTheme}>
      <BrowserRouter>
        <AppShell>
          <SideNavigation />
          <AppShell.Main>
            <AppRoutes />
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;
