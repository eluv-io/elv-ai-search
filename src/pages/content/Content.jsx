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
import GridItems from "@/components/items-grid/GridItems.jsx";
import {IconChevronRight} from "@tabler/icons-react";
import {ArrowBackIcon} from "@/assets/icons/index.js";
import {useInViewport} from "@mantine/hooks";
import useData from "@/hooks/useData.js";

const Content = observer(({show}) => {
  const [viewType, setViewType] = useState("LIST");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [pageVersion, setPageVersion] = useState(1);

  const {ref, inViewport} = useInViewport();

  // const {data: permissionData} = useData(
  //   () => rootStore.userStore.GetLibraryPermissions({libraryId: rootStore.tenantStore.rootFolder?.libraryId}),
  //   [rootStore.tenantStore.rootFolder]
  // );

  useData(
    () => {
      contentStore.GetContentData({
        filterOptions: {
          types: ["mez"],
          // group: contentStore.currentFolderId
        },
        start: ((currentPage - 1) * pageSize),
        limit: pageSize,
        cacheType: "content"
      });
    },
    !!contentStore.currentFolderId,
    [contentStore.currentFolderId, currentPage, pageSize]
  );

  // useData(
  //   () => contentStore.GetContentData({
  //     filterOptions: {
  //       types: ["folder"],
  //       group: contentStore.currentFolderId
  //     },
  //     cacheType: "folder",
  //     sortOptions: {field: "title", desc: false}
  //   }),
  //   !!contentStore.currentFolderId,
  //   [contentStore.currentFolderId]
  // );

  useEffect(() => {
    if(!inViewport || contentStore.loading) { return; }

    const timeout = setTimeout(() => {
      if(
        currentPage < contentStore.paging?.pages &&
        contentStore.contentObjectRecords?.length > 0 &&
        inViewport
      ) {
        setCurrentPage(prev => prev + 1);
      }
    }, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [inViewport, contentStore.loading, currentPage, contentStore.paging]);

  if(!show) { return null; }

  // TODO: Add breadcrumb system
  const breadcrumbs = ["All Content", contentStore.contentFolderName].filter(e => !!e);

  return (
    <Box key={`content-page-${pageVersion}`}>
      {/* TODO: Add folder breadcrumbs */}
      <Flex align="flex-start" gap={8}>
        {
          breadcrumbs.length > 1 ?
            (
              <ActionIcon
                variant="transparent"
                c="elv-gray.8"
                onClick={() => contentStore.UpdateContentFolder(contentStore.rootFolder)}
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
        RefreshCallback={() => setPageVersion(prev => prev + 1)}
      />

      {
        viewType === "LIST" &&
        <ListItems
          records={
            [...contentStore.contentFolderRecords, ...contentStore.contentObjectRecords]
        }
          loading={contentStore.loading}
        />
      }

      {
        viewType === "GRID" &&
        <GridItems
          clips={contentStore.contentObjectRecords}
          enablePagination={false}
          enableInfiniteScroll
        />
      }
      {
        !contentStore.loading &&
        <Box ref={ref} h={20} mt={100} />
      }
    </Box>
  );
});

export default Content;
