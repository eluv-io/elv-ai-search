import {observer} from "mobx-react-lite";
import {Box} from "@mantine/core";
import {useEffect, useState} from "react";
import {contentStore, rootStore} from "@/stores/index.js";
import ContentList from "@/pages/search/content/ContentList.jsx";

const Content = observer(({show}) => {
  const [content, setContent] = useState([]);
  const [paging, setPaging] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);

  const HandleGetResults = async(page=0, limit) => {
    try {
      setLoading(true);

      const contentMetadata = await contentStore.GetContentData({
        filterByFolder: false,
        parentFolder: rootStore.tenantStore.rootFolder,
        start: page,
        limit: limit
      });

      setContent(contentMetadata.content);
      setPaging(contentMetadata.paging);
    } finally {
      setLoading(false);
    }
  };

  const HandleChangePageSize = (value) => {
    setPageSize(value);
  };

  useEffect(() => {
    const LoadData = async() => {
      await HandleGetResults(currentPage, pageSize);
    };

    if(rootStore.tenantStore.rootFolder) {
      LoadData();
    }
  }, [rootStore.tenantStore.rootFolder]);

  useEffect(() => {
    HandleGetResults(currentPage, pageSize);
  }, [pageSize]);

  if(!show) { return null; }


  return (
    <Box>
      <ContentList
        records={content}
        paging={paging}
        loading={loading}
        pageSize={pageSize}
        HandleGetResults={HandleGetResults}
        HandleChangePageSize={HandleChangePageSize}
        HandleNextPage={(value) => HandleGetResults(value, pageSize)}
      />
    </Box>
  );
});

export default Content;
