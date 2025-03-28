import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Box, Flex,
  Group, Stack,
  Text
} from "@mantine/core";
import {useEffect, useState} from "react";
import {contentStore, rootStore} from "@/stores/index.js";
import ContentList from "@/pages/content/list/ContentList.jsx";
import ActionsToolbar from "@/pages/content/actions-toolbar/ActionsToolbar.jsx";
import ClipsGrid from "@/pages/search/clips-grid/ClipsGrid.jsx";
import {IconChevronRight} from "@tabler/icons-react";
import {ArrowBackIcon} from "@/assets/icons/index.js";

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
        parentFolder: contentStore.contentFolderId,
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

    if(contentStore.contentFolderId) {
      LoadData();
    }
  }, [contentStore.contentFolderId, pageSize, currentPage]);

  if(!show) { return null; }

  const breadcrumbs = ["All Content", contentStore.contentFolderName].filter(e => !!e);

  return (
    <Box>
      {/* TODO: Add folder breadcrumbs */}
      <Flex align="flex-start" gap={8}>
        {
          breadcrumbs.length > 1 ?
            (
              <ActionIcon
                variant="transparent"
                c="elv-gray.8"
                onClick={() => contentStore.UpdateContentFolder(null)}
              >
                <ArrowBackIcon />
              </ActionIcon>
            ) : null
        }
        <Stack gap={0}>
          <Group mb={6} gap={12}>
            {
              breadcrumbs
                .map((name, i) => (
                  <>
                    <Text key={name} size="xl" c="elv-gray.8" fw={700} lh={1}>
                      { name }
                    </Text>
                    {
                      (i !== breadcrumbs.length - 1) &&
                      <IconChevronRight />
                    }
                  </>
                ))
            }
          </Group>
          <Group gap={10} mb={24}>
            <Text size="sm" fw={700} lh={1} fs="italic" c="elv-gray.8">
              { rootStore.tenantStore.tenantName }
            </Text>
            <Text fw={400} size="sm" lh={1} c="elv-gray.8">
              { rootStore.tenantStore.tenantId }
            </Text>
          </Group>
        </Stack>
      </Flex>

      <ActionsToolbar
        viewType={viewType}
        setViewType={setViewType}
        HandleGetResults={() => HandleGetResults(currentPage, pageSize)}
      />

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
