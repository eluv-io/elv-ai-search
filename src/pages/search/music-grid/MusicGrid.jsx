import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";
import {Box} from "@mantine/core";
import ClipsGrid from "@/pages/search/clips-grid/ClipsGrid.jsx";

const MusicGrid = observer(() => {
  const clips = searchStore.currentSearch?.resultsBySong || {};

  return (
    <>
      {
        Object.keys(clips).map((song, i) => (
          <Box key={`section-${song}-${i}`} mb={24}>
            <ClipsGrid
              clips={clips[song]}
              song={song}
              view={searchStore.resultsViewType}
              loading={searchStore.loadingSearch}
              ToggleLoading={() => searchStore.ToggleLoadingSearch()}
              enablePagination={false}
            />
          </Box>
        ))
      }
    </>
  );
});

export default MusicGrid;
