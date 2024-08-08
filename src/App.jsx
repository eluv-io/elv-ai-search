import {BrowserRouter} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {AppShell, Loader, MantineProvider} from "@mantine/core";
import MantineTheme from "@/assets/MantineTheme.js";
import "@mantine/core/styles.layer.css";

import SideNavigation from "@/components/side-navigation/SideNavigation.jsx";
import AppRoutes from "./Routes.jsx";
import {rootStore, uiStore} from "@/stores";

const App = observer(() => {
  return (
    <MantineProvider withCssVariables theme={{colorScheme: uiStore.theme, ...MantineTheme}}>
      <BrowserRouter>
        <AppShell
          padding={0}
          navbar={{width: 70, breakpoint: "sm"}}
        >
          <SideNavigation />
          <AppShell.Main>
            {
              rootStore.loaded ?
                <AppRoutes /> : <Loader />
            }
          </AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  );
});

export default App;
