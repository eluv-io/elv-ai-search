import {BrowserRouter} from "react-router-dom";
import {observer} from "mobx-react-lite";
import {AppShell, Loader, MantineProvider} from "@mantine/core";
import MantineTheme from "@/assets/MantineTheme.js";

import "@mantine/core/styles.layer.css";
import "@mantine/dropzone/styles.css";
import "mantine-datatable/styles.layer.css";
import "@mantine/dates/styles.css";
import "./assets/GlobalStyles.css";

import SideNavigation from "@/components/side-navigation/SideNavigation.jsx";
import AppRoutes from "./Routes.jsx";
import {rootStore, uiStore} from "@/stores";
import ErrorBanner from "@/components/error-banner/ErrorBanner.jsx";

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
            <ErrorBanner />
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
