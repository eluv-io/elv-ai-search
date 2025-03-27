import {observer} from "mobx-react-lite";
import {Box, Button, Divider, Group, SegmentedControl, Text, VisuallyHidden} from "@mantine/core";
import {useEffect, useState} from "react";
import {contentStore, rootStore} from "@/stores/index.js";
import ContentList from "@/pages/search/content/ContentList.jsx";
import {FilterIcon, GridIcon, ListIcon} from "@/assets/icons/index.js";
import {IconFolder} from "@tabler/icons-react";

const ActionsToolbar = observer(({viewType, setViewType}) => {
  return (
    <>
      <Group gap={0} mb={12}>
        <Button variant="transparent" size="md" leftSection={<FilterIcon />} c="elv-gray.8">
          Filter
        </Button>
        <Button leftSection={<IconFolder />} size="md">
          New Folder
        </Button>
        <SegmentedControl
          value={viewType}
          onChange={setViewType}
          ml="auto"
          data={[
            {
              value: "LIST",
              label: (
                <>
                  <ListIcon size={20} />
                  <VisuallyHidden>List Layout</VisuallyHidden>
                </>
              )
            },
            {
              value: "GRID",
              label: (
                <>
                  <GridIcon size={20} />
                  <VisuallyHidden>Grid Layout</VisuallyHidden>
                </>
              )
            }
          ]}
        />
      </Group>
      <Divider c="elv-gray.1" mb={24} />
    </>
  );
});

const ListView = observer(({
  show,
  content,
  paging,
  loading,
  pageSize,
  setCurrentPage,
  HandleChangePageSize
}) => {
  if(!show) { return null; }

  return (
    <ContentList
      records={content}
      paging={paging}
      loading={loading}
      pageSize={pageSize}
      setCurrentPage={setCurrentPage}
      HandleChangePageSize={HandleChangePageSize}
    />
  );
});

const GridView = observer(() => {
  return (
    <Box></Box>
  );
});

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
        start: page === 1 ? 0 : ((limit * (page - 1)) + 1),
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


  return (
    <Box>
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

      <ListView
        show={viewType === "LIST"}
        content={content}
        paging={paging}
        loading={loading}
        pageSize={pageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        HandleChangePageSize={HandleChangePageSize}
      />
    </Box>
  );
});

export default Content;
