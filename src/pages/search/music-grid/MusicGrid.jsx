import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";
import {Box, Title} from "@mantine/core";
import ClipsGrid from "@/pages/search/clips-grid/ClipsGrid.jsx";

const MusicGrid = observer(() => {
  const clips = searchStore.currentSearch?.resultsBySong || {};

  return (
    <>
      {
        Object.keys(clips).map((song, i) => (
          <Box key={`section-${song}-${i}`} mb={24}>
            <Title c="elv-gray.8" size="1.5rem" mb={16}>
              { song }
            </Title>
            <ClipsGrid
              clips={clips[song]}
              song={song}
              musicView
            />
          </Box>
        ))
      }
    </>
  );
});

export default MusicGrid;
