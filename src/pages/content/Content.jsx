import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Stack,
  Text
} from "@mantine/core";
import {useEffect, useState} from "react";
import {contentStore, rootStore} from "@/stores/index.js";
import ListItems from "@/components/items-list/ListItems.jsx";
import ActionsToolbar from "@/pages/content/actions-toolbar/ActionsToolbar.jsx";
import ClipsGrid from "@/components/items-grid/GridItems.jsx";
import {IconChevronRight} from "@tabler/icons-react";
import {ArrowBackIcon} from "@/assets/icons/index.js";
import {useInViewport} from "@mantine/hooks";

const Content = observer(({show}) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState([]);
  const [folderContent, setFolderContent] = useState([]);
  const [viewType, setViewType] = useState("LIST");

  const [paging, setPaging] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const {ref, inViewport} = useInViewport();

  const HandleGetFolders = async() => {
    try {
      const folderMetadata = await contentStore.GetContentData({
        filterOptions: {
          types: ["folder"],
          group: contentStore.rootFolder?.objectId
        }
      });

      setFolderContent(folderMetadata.content);
    } catch(error) {
      console.error(error);
    }
  };

  const HandleGetResults = async(page, limit) => {
    try {
      setLoading(true);

      const contentMetadata = await contentStore.GetContentData({
        filterOptions: {
          types: ["mez"],
          group: contentStore.contentFolderId
        },
        start: ((currentPage - 1) * pageSize),
        limit: limit
      });

      if(page === 1) {
        await HandleGetFolders();
      }

      setContent(prev =>
        currentPage === 1 ?
          contentMetadata.content :
          ([...prev || [], ...contentMetadata.content])
      );
      setPaging(contentMetadata.paging);
    } finally {
      setLoading(false);
    }
  };

  // const HandleChangePageSize = (value) => {
  //   setPageSize(value);
  // };

  useEffect(() => {
    const LoadData = async() => {
      await HandleGetResults(currentPage, pageSize);
    };

    // if(contentStore.contentFolderId) {
      LoadData();
    // }
  }, [contentStore.contentFolderId, currentPage]);

  useEffect(() => {
    if(inViewport && !loading && (currentPage < paging?.pages)) {
      setCurrentPage(prev => prev + 1);
    }
  }, [inViewport, loading, currentPage, paging]);

  if(!show) { return null; }

  // TODO: Add breadcrumb system
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
                  <Group key={name}>
                    <Text size="xl" c="elv-gray.8" fw={700} lh={1}>
                      { name }
                    </Text>
                    {
                      (i !== breadcrumbs.length - 1) &&
                      <IconChevronRight />
                    }
                  </Group>
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
        HandleGetResults={() => HandleGetFolders()}
      />

      {
        viewType === "LIST" &&
        <ListItems
          records={
          contentStore.contentFolderId ?
            content :
            [...folderContent, ...content]
        }
          loading={loading}
        />
      }

      {
        viewType === "GRID" &&
        <ClipsGrid
          clips={content}
          enablePagination={false}
          enableInfiniteScroll
        />
      }
      {
        !loading &&
        <Box ref={ref} h={20} mt={30} />
      }
    </Box>
  );
});

export default Content;
