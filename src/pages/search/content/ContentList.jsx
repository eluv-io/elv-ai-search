import {observer} from "mobx-react-lite";
import {ActionIcon, AspectRatio, Box, Button, Divider, Group, Image, Stack, Text, Tooltip} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {IconCopy, IconFolder} from "@tabler/icons-react";
import {FilterIcon, ImageIcon, VideoClipIcon} from "@/assets/icons/index.js";
import {FormatDuration} from "@/utils/helpers.js";
import {rootStore} from "@/stores/index.js";
import {useState} from "react";
import styles from "./ContentList.module.css";
import {permissionLevels} from "@eluvio/elv-client-js/src/client/ContentAccess.js";
import {useClipboard} from "@mantine/hooks";

const EmptyTableCell = () => {
  return <Text c="elv-gray.9">---</Text>;
};

const TitleCell = ({
  isFolder,
  imageSrc,
  imageAspectRatio="1 / 1",
  title,
  id,
  ...props
}) => {
  const clipboard = useClipboard();

  const titleText = (
    <Text fz={16} fw={700} c="elv-gray.8" maw={400} truncate="end" lh={1}>
      { title }
    </Text>
  );

  if(isFolder) {
    return (
      <Group gap={20} {...props}>
        <IconFolder color="var(--mantine-color-elv-gray-3)" />
        { titleText }
      </Group>
    );
  } else {
    return (
      <Group gap={13} {...props}>
        <AspectRatio ratio={imageAspectRatio} maw={70}>
          <Image src={imageSrc} />
        </AspectRatio>
        <Stack gap={6}>
          { titleText }
          <Group gap={8}>
            <Text fz={12} fw={400} c="elv-gray.8" lh={1}>
              { id }
            </Text>
            <Tooltip label={clipboard.copied ? "Copied": "Copy"} position="bottom">
              <ActionIcon
                variant="transparent"
                size="xs"
                onClick={() => clipboard.copy(id)}
              >
                <IconCopy color="var(--mantine-color-elv-gray-8)" height={16} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Stack>
      </Group>
    );
  }
};

const TypeCell = observer(({assetType, startTime, endTime}) => {
  let content;

  if(assetType) {
    content = (
      <>
        <ImageIcon color="var(--mantine-color-elv-green-7)" />
        <Text fz={14} fw={500} c="elv-gray.8" lh={1}>Image</Text>
      </>
    );
  } else {
    content = (
      <>
        <VideoClipIcon color="var(--mantine-color-elv-red-4)" />
        <Stack gap={0}>
          <Text fz={14} fw={500} c="elv-gray.8" lh={1}>Video</Text>
          <Text fz={12} fw={400} c="elv-gray.8" lh={1}>
            { FormatDuration({startTime, endTime}) }
          </Text>
        </Stack>
      </>
    );
  }

  return (
    <Group gap={8}>
      { content }
    </Group>
  );
});

const DateCell = observer(({date}) => {
  if(!date) { return <EmptyTableCell/>; }

  return (
    <Text fz={14} fw={500} c="elv-gray.8">
      {
        new Date(date).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric"
        })
      }
    </Text>
  );
});

const ObjectCell = observer(({versionHash}) => {
  if(!versionHash) { return <EmptyTableCell />; }

  const clipboard = useClipboard({timeout: 2000});

  return (
    <Group gap={8}>
      <Text fz={14} fw={500} c="elv-gray.8" truncate="end" maw={80} lh={1}>
        { versionHash }
      </Text>
      <Tooltip label={clipboard.copied ? "Copied": "Copy"} position="bottom">
        <ActionIcon
          variant="transparent"
          size="xs"
          onClick={() => clipboard.copy(versionHash)}
        >
          <IconCopy color="var(--mantine-color-elv-gray-8)" height={16} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
});

const TagsCell = observer(({tags}) => {
  if(!tags || tags.length === 0) { return <EmptyTableCell />; }

  return (
    <Text fz={14} fw={500} c="elv-gray.8">
      { tags.join(", ") }
    </Text>
  );
});

const AccessCell = observer(({permission}) => {
  if(!Object.hasOwn(permissionLevels, permission)) {
    return <EmptyTableCell />;
  }

  return (
    <Text fz={14} fw={500} c="elv-gray.8">
      {
        permissionLevels[permission].short
      }
    </Text>
  );
});

const TableCell = observer(({isFolder, type, ...props}) => {
  const FolderCondition = (Component) => (isFolder ? <EmptyTableCell /> : Component);

  const cellMap = {
    "title": <TitleCell isFolder={isFolder} {...props} />,
    "type": FolderCondition(<TypeCell {...props} />),
    "access": FolderCondition(<AccessCell {...props} />),
    "date": FolderCondition(<DateCell {...props} />),
    "object": FolderCondition(<ObjectCell {...props} />),
    "tags": FolderCondition(<TagsCell {...props} />)
  };

  return cellMap[type];
});

const ContentList = observer(({records, loading}) => {
  const [selectedRecords, setSelectedRecords] = useState([]);
  // TODO: Add action/state for selectedRecords

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

      <Group gap={0} mb={12}>
        <Button variant="transparent" size="md" leftSection={<FilterIcon />} c="elv-gray.8">
          Filter
        </Button>
        <Button leftSection={<IconFolder />} size="md">
          New Folder
        </Button>
      </Group>

      <Divider c="elv-gray.1" mb={24} />

      <DataTable
        highlightOnHover
        records={records}
        fetching={loading}
        idAccessor="id"
        classNames={{header: styles.tableHeader}}
        minHeight={(!records || records.length === 0) ? 130 : 75}
        columns={[
          {
            accessor: "title",
            title: "Title",
            render: record => (
              <TableCell
                type="title"
                isFolder={record._isFolder}
                title={record.meta?.public?.asset_metadata?.display_title || record.meta?.public?.name || record.id}
                id={record.id}
              />
            )
          },
          {
            accessor: "type",
            title: "Primary Type",
            render: record => (
              <TableCell
                type="type"
                isFolder={record._isFolder}
                assetType={record._assetType}
                startTime={record.start_time}
                endTime={record.end_time}
              />
            )
          },
          {
            accessor: "access",
            title: "Access",
            render: record => (
              <TableCell
                type="access"
                isFolder={record._isFolder}
                permission={record._permission}
              />
            )
          },
          {
            accessor: "lastModified",
            title: "Last Modified",
            render: record => (
              <TableCell
                type="date"
                date={record.meta?.commit?.timestamp}
                isFolder={record._isFolder}
              />
            )
          },
          {
            accessor: "contentObject",
            title: "Content Object",
            render: record => (
              <TableCell
                type="object"
                versionHash={record.hash}
                isFolder={record._isFolder}
              />
            )
          },
          {
            accessor: "tags",
            title: "Tags",
            render: record => (
              <TableCell
                type="tags"
                tags={record._tags}
                isFolder={record._isFolder}
              />
            )
          },
        ]}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
      />
    </Box>
  );
});

export default ContentList;
