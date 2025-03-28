import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Group,
  Image,
  Menu,
  Pagination,
  Select,
  Stack,
  Text,
  Tooltip
} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {IconCopy, IconFolder, IconFolderBolt, IconPencilMinus} from "@tabler/icons-react";
import {
  CopyIcon,
  EditTagIcon,
  ImageIcon,
  ShareIcon,
  TrashIcon,
  VerticalDotsIcon,
  VideoClipIcon
} from "@/assets/icons/index.js";
import {FormatTime} from "@/utils/helpers.js";
import {useState} from "react";
import styles from "./ContentList.module.css";
import {permissionLevels} from "@eluvio/elv-client-js/src/client/ContentAccess.js";
import {useClipboard} from "@mantine/hooks";
import {contentStore, searchStore} from "@/stores/index.js";
import {useNavigate} from "react-router-dom";
import ShareModal from "@/pages/result-details/share-modal/ShareModal.jsx";

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
                onClick={(e) => {
                  e.stopPropagation();
                  clipboard.copy(id);
                }}
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

const TypeCell = observer(({assetType, duration}) => {
  let content;

  // TODO: Find better way to determine type
  if(assetType) {
    content = (
      <>
        <ImageIcon color="var(--mantine-color-elv-green-7)" />
        <Text fz={14} fw={500} c="elv-gray.8" lh={1}>Image</Text>
      </>
    );
  } else if(duration) {
    content = (
      <>
        <VideoClipIcon color="var(--mantine-color-elv-red-4)" />
        <Stack gap={3}>
          <Text fz={14} fw={500} c="elv-gray.8" lh={1}>Video</Text>
          <Text fz={12} fw={400} c="elv-gray.8" lh={1}>
            {
              duration ?
                FormatTime({
                  time: duration,
                  millisecondsFormat: false,
                  hideHour: true
                }) :
                ""
            }
          </Text>
        </Stack>
      </>
    );
  } else {
    return <EmptyTableCell />;
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
          onClick={(e) => {
            e.stopPropagation();
            clipboard.copy(versionHash);
          }}
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

const ActionsCell = observer(({record, setModalData}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const options = [
    {id: "rename-option", Icon: <IconPencilMinus size={16} />, label: "Rename"},
    {id: "duplicate-option", Icon: <CopyIcon width={16} height={16} />, label: "Duplicate"},
    {id: "organize-option", Icon: <IconFolderBolt size={16} />, label: "Organize"},
    {id: "edit-tags-option", Icon: <EditTagIcon size={16} />, label: "Edit Tags"},
    {id: "share-option", Icon: <ShareIcon width={16} height={16} />, label: "Share", HandleClick: () => {
        setModalData({
          id: record.id,
          title: record._title,
          open: true,
          assetType: record._assetType
        });
      }},
    {id: "divider-1", divider: true},
    {id: "delete-option", Icon: <TrashIcon size={16} />, label: "Delete"},
  ];

  return (
    <>
      <Menu
        ml="auto"
        position="bottom-end"
        opened={menuOpen}
        onChange={setMenuOpen}
      >
        <Menu.Target>
          <ActionIcon
            variant="transparent"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(true);
            }}
          >
            <VerticalDotsIcon color="var(--mantine-color-elv-gray-8)" />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          {
            options
              .filter(item => !item.hide)
              .map(item => (
                item.divider ?
                  <Menu.Divider key={item.id} /> :
                  <Menu.Item
                    key={item.id}
                    leftSection={item.Icon}
                    color="var(--mantine-color-elv-gray-9)"
                    onClick={(e) => {
                      e.stopPropagation();
                      item.HandleClick();
                    }}
                    disabled={item.disabled}
                  >
                    { item.label }
                  </Menu.Item>
              ))
          }
        </Menu.Dropdown>
      </Menu>
    </>
  );
});

const TablePagination = observer(({
  loading,
  paging,
  pageSize,
  HandleChangePageSize,
  currentPage,
  setCurrentPage
}) => {
  if(loading || !paging) { return null; }

  const PageSizeOptions = () => {
    const options = [20, 40, 60, 80];

    return options.map(num => (
      {
        value: num.toString(),
        label: num.toString(),
        disabled: paging.items < num
      }
    ));
  };

  return (
    <Group gap={24} mt={48}>
      <Text fz={14} fw={500}>
        {/* TODO: Figure out if paging.last is buggy */}
        {/*{*/}
        {/*  `${paging.current === 0 ? 1 : paging.current}-${paging.last} / ${paging.items.toLocaleString()}`*/}
        {/*}*/}
      </Text>
      <Group ml="auto" align="center" gap={0}>
        <Text fz="sm" mr={8}>Results Per Page</Text>
        <Select
          w={75}
          disabled={pageSize >= paging.items}
          data={PageSizeOptions()}
          value={pageSize.toString()}
          onChange={(value) => HandleChangePageSize(parseInt(value))}
          size="xs"
          mr={16}
        />
        <Pagination
          total={paging.pages}
          value={currentPage}
          onChange={setCurrentPage}
        />
      </Group>
    </Group>
  );
});

const ContentList = observer(({
  records,
  paging,
  loading,
  HandleChangePageSize,
  pageSize,
  currentPage,
  setCurrentPage
}) => {
  const initModalData = {
    id: null,
    open: false,
    onClose: null,
    title: null,
    assetType: false
  };

  const [selectedRecords, setSelectedRecords] = useState([]);
  const [modalData, setModalData] = useState(initModalData);

  const navigate = useNavigate();
  // TODO: Add action/state for selectedRecords

  return (
    <Box>
      <DataTable
        highlightOnHover
        records={records}
        fetching={loading}
        idAccessor="id"
        classNames={{header: styles.tableHeader}}
        minHeight={(!records || records.length === 0) ? 130 : 75}
        onRowClick={({record}) => {
          if(record._isFolder) {
            contentStore.UpdateContentFolder(record);
          } else {
            searchStore.SetSelectedSearchResult({result: record});
            navigate(record.id);
          }
        }}
        columns={[
          {
            accessor: "title",
            title: "Title",
            render: record => (
              <TableCell
                type="title"
                isFolder={record._isFolder}
                title={record._title}
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
                duration={record._duration}
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
          {
            accessor: "actions",
            title: "",
            width: 60,
            render: (record) => (
              <ActionsCell
                record={record}
                setModalData={setModalData}
              />
            )
          }
        ]}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
      />
      <TablePagination
        loading={loading}
        paging={paging}
        pageSize={pageSize}
        HandleChangePageSize={HandleChangePageSize}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <ShareModal
        opened={modalData.open}
        onClose={() => setModalData(initModalData)}
        objectId={modalData.id}
        title={modalData.title}
        assetType={modalData.assetType}
      />
    </Box>
  );
});

export default ContentList;
