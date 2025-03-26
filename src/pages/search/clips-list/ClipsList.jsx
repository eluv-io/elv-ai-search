import {observer} from "mobx-react-lite";
import {AspectRatio, Box, Group, Image, Stack, Text} from "@mantine/core";
import {DataTable} from "mantine-datatable";
import {FormatDuration} from "@/utils/helpers.js";
import {ImageIcon, VideoClipIcon} from "@/assets/icons/index.js";

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

const ClipsList = observer(({records, loading}) => {
  return (
    <Box>
      <DataTable
        highlightOnHover
        idAccessor="objectId"
        fetching={loading}
        minHeight={(!records || records.length === 0) ? 130 : 75}
        records={records}
        columns={[
          {accessor: "title", title: "Title", render: record => (
            <Group>
              <AspectRatio ratio={record._assetType ? (1 / 1) : (16 / 9)} maw={70}>
                <Image src={record._imageSrc} />
              </AspectRatio>
              <Stack gap={0}>
                <Text fz={16} fw={700} c="elv-gray.8">
                  { record._title }
                </Text>
                <Text fz={12} fw={400} c="elv-gray.8">
                  { record.id }
                </Text>
              </Stack>
            </Group>
          )},
          {accessor: "type", title: "Type", render: record => (
            <TypeCell
              record={record}
              assetType={record._assetType}
              startTime={record.start_time}
              endTime={record.end_time}
            />
          )}
        ]}
      />
    </Box>
  );
});

export default ClipsList;
