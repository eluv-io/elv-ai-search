import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Stack,
  Text
} from "@mantine/core";
import {useState} from "react";
import {contentStore, rootStore} from "@/stores/index.js";
import ListItems from "@/components/items-list/ListItems.jsx";
import ActionsToolbar from "@/pages/content/actions-toolbar/ActionsToolbar.jsx";
import GridItems from "@/components/items-grid/GridItems.jsx";
import {IconChevronRight} from "@tabler/icons-react";
import {ArrowBackIcon} from "@/assets/icons/index.js";
import useData from "@/hooks/useData.js";

const Content = observer(({show}) => {
  const [viewType, setViewType] = useState("LIST");
  const [pageVersion, setPageVersion] = useState(1);

  useData(
    () => {
      contentStore.GetContentData({
        filterOptions: {
          types: ["mez"],
          group: contentStore.contentFolderId
        },
        cacheType: "content"
      });
    },
    true,
    [contentStore.contentFolderId]
  );

  useData(
    () => contentStore.GetContentData({
      filterOptions: {
        types: ["folder"],
        group: contentStore.currentFolderId
      },
      cacheType: "folder",
      sortOptions: {field: "title", desc: false}
    }),
    !!contentStore.currentFolderId,
    [contentStore.currentFolderId]
  );

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
        />
      }
    </Box>
  );
});

export default Content;
