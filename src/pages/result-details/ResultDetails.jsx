import {observer} from "mobx-react-lite";
import {Box, Flex} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";

import ResultDetailsMain from "@/pages/result-details/details-main/ResultDetailsMain.jsx";
import ResultDetailsSidebar from "@/pages/result-details/sidebar/ResultDetailsSidebar.jsx";
import ResultDetailsNavToolbar from "@/pages/result-details/nav-toolbar/ResultDetailsNavToolbar.jsx";
import {searchStore} from "@/stores/index.js";

const ResultDetails = observer(() => {
  const clip = searchStore.selectedSearchResult;

  const [openedSidebar, {open, close}] = useDisclosure(true);

  if(!clip) { return null; }

  return (
    <Box p="8 0 24">
      <Flex direction="row" pl={"calc(110px - 28px - 2.125rem"} gap={28}>
        <ResultDetailsNavToolbar />

        {/* Left panel with video */}
        <Flex justify="center" pr={20} direction="row" gap={20} flex={1}>
          <ResultDetailsMain
            clip={clip}
            open={open}
            openedSidebar={openedSidebar}
          />

          {/* Right panel */}
          <ResultDetailsSidebar
            opened={openedSidebar}
            open={open}
            close={close}
          />
        </Flex>
      </Flex>
    </Box>
  );
});

export default ResultDetails;
