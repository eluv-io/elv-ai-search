import {Stack} from "@mantine/core";
import {ArrowLeftIcon, ArrowRightIcon} from "@/assets/icons/index.js";
import {useNavigate} from "react-router-dom";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";
import {observer} from "mobx-react-lite";
import {searchStore, overlayStore, contentStore} from "@/stores/index.js";

const ResultDetailsNavToolbar = observer(() => {
  const navigate = useNavigate();

  const HandleNavClip = async(prev) => {
    const currentClip = searchStore.selectedSearchResult;
    let newIndex = prev ? (currentClip._index - 1) : (currentClip._index + 1);
    let clips = currentClip._contentType ? (contentStore.contentObjects || []) : (searchStore.searchResults || []);
    let newClip = clips?.[newIndex];

    if(newClip) {
      searchStore.SetSelectedSearchResult({result: null});
      searchStore.SetSelectedSearchResult({result: newClip});
      overlayStore.IncrementPageVersion();
      navigate(`/search/${newClip.id}`);
    } else {
      // Clip is last on page
      // Retrieve next page
      try {
        searchStore.ToggleLoadingSearchResult();
        const newPage = prev ? (searchStore.pagination.currentPage - 1) : (searchStore.pagination.currentPage + 1);
        newIndex = prev ? (searchStore.pagination.pageSize - 1)  : 0;

        if(currentClip._contentType) {
          clips = contentStore.contentObjects || [];
        } else {
          await searchStore.GetNextPageResults({
            fuzzySearchValue: searchStore.currentSearch.terms,
            page: newPage
          });

          clips = searchStore.searchResults || [];
        }
        let newClip = clips[newIndex];

        if(newClip) {
          searchStore.SetSelectedSearchResult({result: null});
          searchStore.SetSelectedSearchResult({result: newClip});
          overlayStore.IncrementPageVersion();
          navigate(`/search/${newClip.id}`);
        }
      } finally {
        searchStore.ToggleLoadingSearchResult();
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
        disabled={searchStore.selectedSearchResult._indexTotalRes === 0}
      />
      <SecondaryButton
        size="lg"
        iconOnly
        Icon={ArrowRightIcon}
        onClick={() => HandleNavClip(false)}
        disabled={searchStore.selectedSearchResult._indexTotalRes === (searchStore.pagination.totalResultsPerPage)}
      />
    </Stack>
  );
});

export default ResultDetailsNavToolbar;
