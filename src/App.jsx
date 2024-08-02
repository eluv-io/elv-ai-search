import {AppShell, MantineProvider} from "@mantine/core";
import MantineTheme from "@/assets/MantineTheme.js";
import {BrowserRouter} from "react-router-dom";

const App = () => {
  return (
    <MantineProvider withCssVariables theme={MantineTheme}>
      <BrowserRouter>
        <AppShell>
          <AppShell.Main></AppShell.Main>
        </AppShell>
      </BrowserRouter>
    </MantineProvider>
  )
};

export default App;
