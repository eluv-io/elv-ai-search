import {Group} from "@mantine/core";
import {ArrowLeftIcon, ArrowRightIcon} from "@/assets/icons/index.js";
import {useNavigate} from "react-router-dom";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";

const VideoDetailsTopToolbar = observer(() => {
  const navigate = useNavigate();

  const HandlePrevious = () => {
    const currentClip = searchStore.selectedSearchResult;
    const prevIndex = currentClip._index - 1;
    const prevClip = searchStore.currentSearch?.results?.contents?.[prevIndex];

    if(prevClip) {
      searchStore.SetSelectedSearchResult({result: prevClip});
      navigate(`/search/${prevClip.id}`);
    }
  };

  const HandleNext = () => {
    const currentClip = searchStore.selectedSearchResult;
    const nextIndex = currentClip._index + 1;
    const nextClip = searchStore.currentSearch?.results?.contents?.[nextIndex];

    if(nextClip) {
      searchStore.SetSelectedSearchResult({result: nextClip});
      navigate(`/search/${nextClip.id}`);
    }
  };

  return (
    <Group mb={24} ml={24} gap={40}>
      <SecondaryButton
        size="lg"
        iconOnly
        Icon={ArrowLeftIcon}
        onClick={() => navigate("/search", {state: {persistSearchResults: true}})}
      />

      <Group gap={12}>
        <SecondaryButton LeftIcon={ArrowLeftIcon} onClick={HandlePrevious}>
          Previous
        </SecondaryButton>
        <SecondaryButton LeftIcon={ArrowRightIcon} onClick={HandleNext}>
          Next
        </SecondaryButton>
      </Group>
    </Group>
  );
});

export default VideoDetailsTopToolbar;
