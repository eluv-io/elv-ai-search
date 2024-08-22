import {Box, Flex} from "@mantine/core";
import {observer} from "mobx-react-lite";
import {tenantStore} from "@/stores/index.js";
import {useEffect, useState} from "react";
import CreateVideoMain from "@/pages/create/video-container/CreateVideoMain.jsx";
import {useDisclosure} from "@mantine/hooks";
import CreateSidebar from "@/pages/create/create-sidebar/CreateSidebar.jsx";
import CreateNavBar from "@/pages/create/create-navbar/CreateNavbar.jsx";

const Create = observer(() => {
  const [openedSidebar, {open, close}] = useDisclosure(true);
  const [summaryResults, setSummaryResults] = useState(null);

  useEffect(() => {
    const LoadData = async() => {
      await tenantStore.GetLibraries();
    };

    LoadData();
  }, []);

  return (
    <Box h="100vh">
      <Flex justify="space-between" direction="row" h="100%">
        <CreateNavBar setSummaryResults={setSummaryResults} />
        <CreateVideoMain
          openedSidebar={openedSidebar}
          open={open}
          summaryResults={summaryResults}
        />
        <CreateSidebar
          opened={openedSidebar}
          close={close}
          summaryResults={summaryResults}
        />
      </Flex>
    </Box>
  );
});

export default Create;
