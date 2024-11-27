import {observer} from "mobx-react-lite";
import {ActionIcon, AspectRatio, Box, Button, Image, Table, Text} from "@mantine/core";
import {useState} from "react";
import {searchStore, videoStore} from "@/stores/index.js";
import {PlayIcon} from "@/assets/icons/index.js";

const Rows = ({rows=[], playable=true}) => {
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
        <Table.Td>
          <Text size="xs" c="dimmed">{ row.tags }</Text>
        </Table.Td>
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
};

const TagsTable = observer(({resultsPerPage=10, tags=[]}) => {
  const rows = (tags || []).map((tagItem, i) => (
    {
      image: tagItem._coverImage,
      timestamp: videoStore.TimeToSMPTE({time: tagItem.start_time / 1000}),
      tags: tagItem.text.length > 0 ? tagItem.text.join(", ") : "",
      id: `tag-${tagItem.id || i}-${tagItem.start_time}-${tagItem.end_time}`,
      action: {
        icon: (
          <ActionIcon
            variant="transparent"
            aria-label="Play button"
            title="Play Segment"
            onClick={() => videoStore.PlaySegment({startTime: tagItem.start_time, endTime: tagItem.end_time})}
          >
            <PlayIcon width={18} height={18} color="var(--mantine-color-elv-neutral-5)" style={{verticalAlign: "middle"}} />
          </ActionIcon>
        )
      }
    }
  ));

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
