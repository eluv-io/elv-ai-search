import {Stack} from "@mantine/core";
import {ArrowLeftIcon, ArrowRightIcon} from "@/assets/icons/index.js";
import {useNavigate} from "react-router-dom";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import {observer} from "mobx-react-lite";
import {searchStore} from "@/stores/index.js";

const VideoDetailsNavToolbar = observer(() => {
  const navigate = useNavigate();

  const HandleNavClip = (prev) => {
    const currentClip = searchStore.selectedSearchResult;
    const newIndex = prev ? (currentClip._index - 1) : (currentClip._index + 1);
    const newClip = searchStore.currentSearch?.results?.contents?.[newIndex];

    if(newClip) {
      searchStore.SetSelectedSearchResult({result: newClip});
      navigate(`/search/${newClip.id}`);
    }
  };

  return (
    <Stack gap={8}>
      <SecondaryButton
        size="lg"
        iconOnly
        Icon={ArrowLeftIcon}
        onClick={() => HandleNavClip(true)}
      />
      <SecondaryButton
        size="lg"
        iconOnly
        Icon={ArrowRightIcon}
        onClick={() => HandleNavClip(false)}
      />
    </Stack>
  );
});

export default VideoDetailsNavToolbar;
