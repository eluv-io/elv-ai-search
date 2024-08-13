import {observer} from "mobx-react-lite";
import {Box, Button, Table, Text} from "@mantine/core";
import {useState} from "react";

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
      </Table.Tr>
    ))
  );
};

const TagsTable = observer(({headers=[], rows=[], resultsPerPage=10}) => {
  const [pagination, setPagination] = useState({
    total: rows.length,
    currentPage: 1,
    resultsPerPage
  });
  const [paginatedRows, setPaginatedRows] = useState(rows.slice(0, (resultsPerPage + 1) * pagination.currentPage));

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
