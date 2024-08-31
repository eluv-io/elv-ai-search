import {observer} from "mobx-react-lite";
import {ActionIcon, Box, Button, Table, Text} from "@mantine/core";
import {useState} from "react";
import {FormatTime} from "@/utils/helpers.js";
import {videoStore} from "@/stores/index.js";
import {PlayIcon} from "@/assets/icons/index.js";

const Rows = ({rows=[]}) => {
  return (
    rows.map(row => (
      <Table.Tr key={row.id}>
        <Table.Td>
          <Text size="xs">{ row.timestamp }</Text>
          </Table.Td>
        <Table.Td>
          <Text size="xs" c="dimmed" lineClamp={1}>{ row.tags }</Text>
        </Table.Td>
        <Table.Td align="center">
          {
            row.action ?
            row.action.icon : null
          }
        </Table.Td>
      </Table.Tr>
    ))
  );
};

const TagsTable = observer(({resultsPerPage=10, tags=[]}) => {
  const rows = tags.map((tagItem, i) => (
    {
      timestamp: FormatTime({time: tagItem.start_time}),
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
  const headers = ["Timestamps", "Tags"];

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
          <Rows rows={paginatedRows} />
        </Table.Tbody>
      </Table>
      {
        (pagination.currentPage * pagination.resultsPerPage) < pagination.total &&
        <Button
          variant="transparent"
          c="elv-neutral.4"
          size="xs"
          p="0.625rem"
          onClick={HandleNextPage}
        >
          View More
        </Button>
      }
    </Box>
  );
});

export default TagsTable;
