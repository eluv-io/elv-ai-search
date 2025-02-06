import {Stack} from "@mantine/core";
import {ArrowLeftIcon, ArrowRightIcon} from "@/assets/icons/index.js";
import {useNavigate} from "react-router-dom";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import {observer} from "mobx-react-lite";
import {searchStore, overlayStore} from "@/stores/index.js";

const ResultDetailsNavToolbar = observer(() => {
  const navigate = useNavigate();

  const HandleNavClip = async(prev) => {
    const currentClip = searchStore.selectedSearchResult;
    let newIndex = prev ? (currentClip._index - 1) : (currentClip._index + 1);
    let clips = searchStore.searchResults || [];
    let newClip = clips?.[newIndex];

    if(newClip) {
      searchStore.SetSelectedSearchResult({result: null});
      searchStore.SetSelectedSearchResult({result: newClip});
      overlayStore.IncrementPageVersion();
      navigate(`/search/${newClip.id}`);
    } else {
      // Clip is last on page
      // Retrieve next page
      await searchStore.GetNextPageResults({
        fuzzySearchValue: searchStore.currentSearch.terms,
        page: searchStore.pagination.currentPage + 1,
        // cacheResults: false
      });

      clips = searchStore.searchResults || [];
      newIndex = 0;
      let newClip = clips[newIndex];

      if(newClip) {
        searchStore.SetSelectedSearchResult({result: null});
        searchStore.SetSelectedSearchResult({result: newClip});
        overlayStore.IncrementPageVersion();
        navigate(`/search/${newClip.id}`);
      }
    }
  };

  return (
    <Stack gap={8}>
      <SecondaryButton
        size="lg"
        iconOnly
        Icon={ArrowLeftIcon}
        onClick={() => HandleNavClip(true)}
        disabled={searchStore.selectedSearchResult._index === 0}
      />
      <SecondaryButton
        size="lg"
        iconOnly
        Icon={ArrowRightIcon}
        onClick={() => HandleNavClip(false)}
        disabled={searchStore.selectedSearchResult._indexTotalRes === (searchStore.pagination.totalResults)}
      />
    </Stack>
  );
});

export default ResultDetailsNavToolbar;
