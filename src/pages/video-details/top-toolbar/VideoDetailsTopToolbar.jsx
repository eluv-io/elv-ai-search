import {Box, Flex, Group} from "@mantine/core";
import {ArrowLeftIcon, ArrowRightIcon} from "@/assets/icons/index.js";
import {useNavigate} from "react-router-dom";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";

const VideoDetailsTopToolbar = observer(() => {
  const navigate = useNavigate();

  const HandleNavClip = (prev) => {
    // searchStore.SetSelectedSearchResult({result: null});

    const currentClip = searchStore.selectedSearchResult;
    const newIndex = prev ? (currentClip._index - 1) : (currentClip._index + 1);
    const newClip = searchStore.currentSearch?.results?.contents?.[newIndex];

    if(newClip) {
      searchStore.SetSelectedSearchResult({result: newClip});
      navigate(`/search/${newClip.id}`);
    }
  };

  return (
    <Flex justify="center">
      <Box w="100%">
        <Group mb={16} gap={40} pl={110}>
          <SecondaryButton
            size="lg"
            iconOnly
            Icon={ArrowLeftIcon}
            onClick={() => navigate("/search", {state: {persistSearchResults: true}})}
          />

          <Group gap={12}>
            <SecondaryButton LeftIcon={ArrowLeftIcon} onClick={() => HandleNavClip(true)}>
              Previous
            </SecondaryButton>
            <SecondaryButton LeftIcon={ArrowRightIcon} onClick={() => HandleNavClip(false)}>
              Next
            </SecondaryButton>
          </Group>
        </Group>
      </Box>
    </Flex>
  );
});

export default VideoDetailsTopToolbar;
