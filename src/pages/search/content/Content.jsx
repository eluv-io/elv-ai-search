import {observer} from "mobx-react-lite";
import {
  Box,
  Group,
  Text
} from "@mantine/core";
import {useEffect, useState} from "react";
import {contentStore, rootStore} from "@/stores/index.js";
import ContentList from "@/pages/search/content/list/ContentList.jsx";
import ActionsToolbar from "@/pages/search/content/actions-toolbar/ActionsToolbar.jsx";
import ClipsGrid from "@/pages/search/clips-grid/ClipsGrid.jsx";

const Content = observer(({show}) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState([]);
  const [viewType, setViewType] = useState("LIST");

  const [paging, setPaging] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const HandleGetResults = async(page, limit) => {
    try {
      setLoading(true);

      const contentMetadata = await contentStore.GetContentData({
        filterByFolder: false,
        parentFolder: rootStore.tenantStore.rootFolder,
        start: ((currentPage - 1) * pageSize),
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
  }, [pageSize, currentPage]);

  if(!show) { return null; }
  console.log("content", content)

  return (
    <Box>
      {/* TODO: Add folder breadcrumbs */}
      <Text size="xl" c="elv-gray.8" fw={700} lh={1} mb={6}>
        All Content
      </Text>
      <Group gap={10} mb={24}>
        <Text size="sm" fw={700} lh={1} fs="italic" c="elv-gray.8">
          { rootStore.tenantStore.tenantName }
        </Text>
        <Text fw={400} size="sm" lh={1} c="elv-gray.8">
          { rootStore.tenantStore.tenantId }
        </Text>
      </Group>

      <ActionsToolbar viewType={viewType} setViewType={setViewType} />

      {
        viewType === "LIST" &&
        <ContentList
          records={content}
          paging={paging}
          loading={loading}
          pageSize={pageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          HandleChangePageSize={HandleChangePageSize}
        />
      }

      {
        viewType === "GRID" &&
        <ClipsGrid
          clips={content}
        />
      }
    </Box>
  );
});

export default Content;
