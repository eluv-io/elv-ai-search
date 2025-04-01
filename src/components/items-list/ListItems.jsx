import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Group,
  Image,
  Menu,
  Modal,
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
  ShareIcon,
  TrashIcon,
  VerticalDotsIcon,
} from "@/assets/icons/index.js";
import {FormatTime} from "@/utils/helpers.js";
import {useState} from "react";
import styles from "./ListItems.module.css";
import {permissionLevels} from "@eluvio/elv-client-js/src/client/ContentAccess.js";
import {useClipboard} from "@mantine/hooks";
import {contentStore, searchStore} from "@/stores/index.js";
import {useNavigate} from "react-router-dom";
import ShareModal from "@/pages/result-details/share-modal/ShareModal.jsx";
import {MEDIA_TYPES} from "@/utils/constants.js";
import {ModalTitle, RenameModal} from "@/pages/content/modals/ContentModals.jsx";

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
    <Text fz={16} fw={700} c="elv-gray.8" maw={400} truncate="end" lh="normal">
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
            <Text fz={12} fw={400} c="elv-gray.8" lh="normal">
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

const TypeCell = observer(({mediaType, duration}) => {
  const data = MEDIA_TYPES[mediaType];

  if(!data) { return <EmptyTableCell />; }

  return (
    <Group gap={8}>
      <data.Icon color={`var(--mantine-color-${data.iconColor})`} />
      <Stack gap={3}>
        <Text fz={14} fw={500} c="elv-gray.8" lh={1}>
          { data.label }
        </Text>
        <Text fz={12} fw={400} c="elv-gray.8" lh={1}>
          {
            duration ?
              FormatTime({
                time: parseInt(duration || ""),
                millisecondsFormat: false,
                hideHour: true
              }) :
              ""
          }
        </Text>
      </Stack>
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
  tags = (tags || []).filter(tag => !tag?.startsWith("elv:"));

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

const ActionsCell = observer(({record, setModalData, setShareModalData, CloseModal}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const options = [
    {
      id: "rename-option",
      Icon: <IconPencilMinus size={16} />,
      label: "Rename",
      HandleClick: () => {
        setModalData({
          id: record.id,
          title: <ModalTitle title="Rename" Icon={IconPencilMinus} />,
          CloseModal,
          children: (
            <RenameModal
              defaultValue={record._title}
              CloseModal={CloseModal}
              objectId={record.id}
              RefreshCallback={() => {}}
            />
          ),
          open: true
        });
      }
    },
    {
      id: "duplicate-option",
      Icon: <CopyIcon width={16} height={16} />,
      label: "Duplicate"
    },
    {
      id: "organize-option",
      Icon: <IconFolderBolt size={16} />,
      label: "Organize"
    },
    {
      id: "edit-tags-option",
      Icon: <EditTagIcon size={16} />,
      label: "Edit Tags"
    },
    {
      id: "share-option",
      Icon: <ShareIcon width={16} height={16} />,
      label: "Share",
      HandleClick: () => setShareModalData({open: true})
      // HandleClick: () => {
      //   setModalData({
      //     id: record.id,
      //     title: record._title,
      //     open: true,
      //     assetType: record._assetType,
      //     children: <ShareModal />
      //   });
      // }
      },
    {id: "divider-1", divider: true},
    {
      id: "delete-option",
      Icon: <TrashIcon size={16} />,
      label: "Delete"
    },
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

const ListItems = observer(({
  records,
  loading
}) => {
  const initShareModalData = {
    id: null,
    open: false,
    title: null,
    assetType: false
  };

  const initModalData = {
    title: null,
    open: false,
    children: null
  };

  const [selectedRecords, setSelectedRecords] = useState([]);
  const [shareModalData, setShareModalData] = useState(initShareModalData);
  const [modalData, setModalData] = useState(initModalData);

  const navigate = useNavigate();
  // TODO: Add action/state for selectedRecords

  const CloseModal = () => setModalData({...modalData, open: false});

  return (
    <Box>
      <DataTable
        highlightOnHover
        records={records}
        fetching={loading}
        idAccessor={({start_time, end_time, id}) => `${id}-${start_time || ""}-${end_time || ""}`}
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
                mediaType={record._queryFields?.media_type}
                duration={record._queryFields?.duration}
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
                setShareModalData={setShareModalData}
                CloseModal={CloseModal}
              />
            )
          }
        ]}
        selectedRecords={selectedRecords}
        onSelectedRecordsChange={setSelectedRecords}
      />

      <ShareModal
        opened={shareModalData.open}
        onClose={() => setShareModalData({...shareModalData, open: false})}
        objectId={shareModalData.id}
        title={shareModalData.title}
        assetType={shareModalData.assetType}
      />
      <Modal
        opened={modalData.open}
        onClose={CloseModal}
        title={modalData.title}
        size={480}
        centered
      >
        { modalData.children || null }
      </Modal>
    </Box>
  );
});

export default ListItems;
