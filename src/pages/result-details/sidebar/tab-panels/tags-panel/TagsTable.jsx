import {observer} from "mobx-react-lite";
import {
  ActionIcon,
  AspectRatio,
  Box,
  Button,
  Group,
  Image,
  Stack,
  Table,
  Text,
  TextInput,
  UnstyledButton
} from "@mantine/core";
import {useState} from "react";
import {searchStore, videoStore, overlayStore} from "@/stores/index.js";
import {PencilIcon, PlayIcon} from "@/assets/icons/index.js";

const EditView = ({
  tagValue,
  setTagValue,
  setEditEnabled,
  saving,
  setSaving,
  EditCallback,
  ClickCallback,
  tagOverlayEnabled,
  CloseOverlayCallback
}) => {
  return (
    <Stack gap={0}>
      <TextInput
        size="xs"
        mb={8}
        value={tagValue}
        onChange={(event) => setTagValue(event.target.value)}
      />
      <Group gap={6} justify="flex-end">
        <Button variant="outline" size="xs" onClick={() => setEditEnabled(false)}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="xs"
          disabled={saving}
          loading={saving}
          onClick={async() => {
            try {
              setSaving(true);
              await EditCallback(tagValue);

              CloseOverlayCallback();
            } finally {
              setSaving(false);
            }
          }}
        >
          Commit
        </Button>
      </Group>
    </Stack>
  );
};

const TagContent = observer(({clickable, ClickCallback, tagText, EditCallback, tagOverlayEnabled, CloseOverlayCallback}) => {
  const [editEnabled, setEditEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tagValue, setTagValue] = useState(tagText);

  const DisplayView = () => {
    return (
      clickable ?
        (
          <Group>
            <UnstyledButton onClick={ClickCallback} flex={2}>
              <Text size="xs" c="dimmed">{ tagText }</Text>
            </UnstyledButton>
            {
              searchStore.selectedSearchResult?._assetType &&
              <ActionIcon variant="transparent" title="Edit Tag" onClick={() => setEditEnabled(true)}>
                <PencilIcon />
              </ActionIcon>
            }
          </Group>
        ) :
        <Text size="xs" c="dimmed">{ tagText }</Text>
    );
  };

  return (
    <Table.Td>
      {
        editEnabled ?
          <EditView
            tagValue={tagValue}
            setTagValue={setTagValue}
            saving={saving}
            setSaving={setSaving}
            EditCallback={EditCallback}
            setEditEnabled={setEditEnabled}
            ClickCallback={ClickCallback}
            tagOverlayEnabled={tagOverlayEnabled}
            CloseOverlayCallback={CloseOverlayCallback}
          /> :
          <DisplayView />
      }
    </Table.Td>
  );
});

const Rows = observer(({rows=[], playable=true}) => {
  console.log("rows", rows)
  return (
    rows.map(row => (
      <Table.Tr key={row.id}>
        {
          row.image &&
          <Table.Td>
            <AspectRatio ratio={1}>
              <Image
                src={row.image}
                fit="contain"
                w="auto"
              />
            </AspectRatio>
          </Table.Td>
        }
        {
          row.timestamp &&
          <Table.Td w="100px">
            <Text size="xs">{ row.timestamp }</Text>
          </Table.Td>
        }
        <TagContent
          clickable={!!row.tagClickCallback}
          ClickCallback={row.tagClickCallback}
          tagOverlayEnabled={row.tagOverlayEnabled}
          tagText={row.tagText}
          EditCallback={row.EditCallback}
          CloseOverlayCallback={row.CloseOverlayCallback}
        />
        {
          playable &&
          <Table.Td align="center" w="50px">
            {
              row.action ?
              row.action.icon : null
            }
          </Table.Td>
        }
      </Table.Tr>
    ))
  );
});

const TagsTable = observer(({
  resultsPerPage=10,
  tags=[],
  tableId,
  field
}) => {
  const rows = (tags || []).map((tagItem, i) => {
    const tagText = Array.isArray(tagItem?.text) ? tagItem?.text?.length > 0 ? tagItem?.text.join(", ") : "" :
      tagItem.text;

    const rowId = `${tableId}-${i}`;
    let tagClickCallback;
    const tagOverlayEnabledMap = {};

    if(tagItem?.box) {
      tagClickCallback = () => {
        if(tagOverlayEnabledMap[rowId]) {
          overlayStore.ResetEntry();
        } else {
          overlayStore.SetEntry({
            entry: {
              box: tagItem?.box,
              confidence: tagItem?.confidence,
              text: tagItem?.text
            }
          });
        }

        tagOverlayEnabledMap[rowId] = !tagOverlayEnabledMap[rowId];
      };
    } else {
      tagClickCallback = null;
    }

    const EditCallback = async(value) => {
      const path = `${searchStore.selectedSearchResult?._prefix}/image_tags/${field}/tags/${i}/text`;
      const copyPath = `${searchStore.selectedSearchResult?._prefix}/manual_tags/${field}/tags/${i}/text`;

      await searchStore.UpdateTags({
        libraryId: searchStore.selectedSearchResult.qlib_id,
        objectId: searchStore.selectedSearchResult.id,
        metadataSubtree: path,
        copyPath,
        value,
        tagIndex: i,
        tagKey: tableId
      });
    };
    console.log("overlay store", overlayStore)

    return {
      image: tagItem?._coverImage,
      timestamp: videoStore.TimeToSMPTE({time: tagItem.start_time / 1000}),
      tagText,
      tagClickCallback,
      CloseOverlayCallback: overlayStore.ResetEntry(),
      tagOverlayEnabled: tagOverlayEnabledMap[rowId],
      id: `tag-${tagItem.id || i}-${tagItem?.start_time}-${tagItem?.end_time}`,
      EditCallback,
      action: {
        icon: (
          <ActionIcon
            variant="transparent"
            aria-label="Play button"
            title="Play Segment"
            onClick={() => videoStore.PlaySegment({startTime: tagItem.start_time, endTime: tagItem.end_time})}
          >
            <PlayIcon width={18} height={18} color="var(--mantine-color-elv-neutral-5)" style={{verticalAlign: "middle"}}/>
          </ActionIcon>
        )
      }
    };
  });

  const [pagination, setPagination] = useState({
    total: rows.length,
    currentPage: 1,
    resultsPerPage
  });

  const [paginatedRows, setPaginatedRows] = useState(rows.slice(0, (resultsPerPage + 1) * pagination.currentPage));

  const hasImage = rows.some(item => item.image);
  const headers = searchStore.selectedSearchResult?._assetType ? ["Tag"] : hasImage ? ["", "Timestamp", "Tag"] : ["Timestamp", "Tag"];

  const HandleNextPage = () => {
    const newCurrentPage = pagination.currentPage + 1;
    const newRows = rows.slice(0, (resultsPerPage + 1) * newCurrentPage);
    setPagination(prevState => (
      {
        ...prevState,
        currentPage: prevState.currentPage + 1
      }
    ));
    setPaginatedRows(newRows);
  };

  return (
    <Box mb={22}>
      <Table mt={8}>
        <Table.Thead>
          <Table.Tr>
            {
              headers.map(header => (
                <Table.Th key={header}>
                  <Text size="xs" style={{whiteSpace: "nowrap"}}>{ header }</Text>
                </Table.Th>
              ))
            }
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          <Rows rows={paginatedRows} playable={!searchStore.selectedSearchResult?._assetType} />
        </Table.Tbody>
      </Table>
      {
        (pagination.currentPage * pagination.resultsPerPage) < pagination.total &&
        <Button
          variant="transparent"
          c="elv-neutral.4"
          size="xs"
          pl="0.625rem"
          lh={2}
          onClick={HandleNextPage}
        >
          View More
        </Button>
      }
    </Box>
  );
});

export default TagsTable;
