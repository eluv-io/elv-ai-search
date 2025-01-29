import {observer} from "mobx-react-lite";
import {useState} from "react";
import TextCard from "@/components/text-card/TextCard.jsx";
import {searchStore, summaryStore} from "@/stores/index.js";
import {ActionIcon, Box, Button, Flex, Grid, Group, Loader, Paper, Stack, Text, TextInput, Title} from "@mantine/core";
import {IconPencil, IconReload} from "@tabler/icons-react";

const CaptionEditView = observer(({
  CancelEdit,
  HandleReload
}) => {
  const [saving, setSaving] = useState(false);
  const HandleEdit = (event) => {
    try {
      setSaving(true);
      event.preventDefault();

      // const formData = new FormData(event.target);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box w="100%">
      <Group align="flex-start">
        <Flex flex={2}>
          <form onSubmit={HandleEdit} style={{width: "100%"}}>
            {
              [
                {keyName: "Location", value: searchStore.selectedSearchResult?._info_image?.Location},
                {keyName: "City", value: searchStore.selectedSearchResult?._info_image.City},
                {keyName: "State", value: searchStore.selectedSearchResult?._info_image.State},
                {keyName: "Source", value: searchStore.selectedSearchResult?._info_image.Source},
              ]
                .map(item => (
                  <Grid key={item.keyName} align="center" w="100%">
                    <Grid.Col span={2}>
                      <Text c="elv-gray.9" fz="sm" fw={700} lh={1.25}>{ item.keyName }:</Text>
                    </Grid.Col>
                    <Grid.Col span={10}>
                      <TextInput
                        size="xs"
                        lh={1.25}
                        name={item.keyName}
                        defaultValue={item.value}
                      />
                    </Grid.Col>
                  </Grid>
                ))
            }
          </form>
        </Flex>

        <Flex gap={6} justify="flex-end" flex={1} direction="row">
          <Group gap={0} mr={6}>
            <IconPencil color="var(--mantine-color-elv-gray-5)" height={16} />
            <Text size="xs" c="dimmed">Editing</Text>
          </Group>
          <ActionIcon
            size="sm"
            onClick={HandleReload}
            title="Re-generate"
          >
            <IconReload />
          </ActionIcon>
        </Flex>
      </Group>
      <Group mt={24} gap={6} justify="flex-end">
        <Button variant="outline" onClick={CancelEdit}>Cancel</Button>
        <Button type="submit" disabled={saving} loading={saving}>
          Commit
        </Button>
      </Group>
    </Box>
  );
});

const CaptionDisplayView = observer(({title, editEnabled, setEditEnabled, HandleReload}) => {
  return (
    <Box>
      <Group gap={0} w="100%">
        <Title order={4} c="elv-gray.8" lh={1} truncate="end">{ title }</Title>
        <Group ml="auto" gap={6}>
          {
            editEnabled ?
              (
                <Group gap={0} mr={6}>
                  <IconPencil color="var(--mantine-color-elv-gray-5)" height={16} />
                  <Text size="xs" c="dimmed">Editing</Text>
                </Group>
              ) :
              (
                <ActionIcon
                  variant="outline"
                  size="sm"
                  onClick={() => setEditEnabled(true)}
                >
                  <IconPencil />
                </ActionIcon>
              )
          }
          <ActionIcon
            size="sm"
            onClick={HandleReload}
          >
            <IconReload />
          </ActionIcon>
        </Group>
      </Group>
      <Stack gap={0} lh={1} mt={8}>
        {
          [
            {keyName: "Location", value: searchStore.selectedSearchResult?._info_image?.Location},
            {keyName: "File Name", value: searchStore.selectedSearchResult?._info_image.filename},
            {keyName: "City", value: searchStore.selectedSearchResult?._info_image.City},
            {keyName: "State", value: searchStore.selectedSearchResult?._info_image.State},
            {keyName: "Source", value: searchStore.selectedSearchResult?._info_image.Source},
          ]
            .filter(item => !!item.value)
            .map(item => (
              <Group key={item.keyName} gap={5}>
                <Text c="elv-gray.9" fz="sm" fw={700} lh={1.25}>{ item.keyName }:</Text>
                <Text c="elv-gray.9" fz="sm" lh={1.25}>{ item.value }</Text>
              </Group>
            ))
        }
      </Stack>
    </Box>
  );
});

const CaptionSection = observer(({clip}) => {
  const [loading, setLoading] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);

  const HandleReload = async() => {
    try {
      setLoading(true);
      searchStore.UpdateSelectedSearchResult({key: "_summary", value: null});

      await summaryStore.GetSummaryResults({
        objectId: clip.id,
        startTime: clip.start_time,
        endTime: clip.end_time,
        prefix: clip.prefix,
        assetType: clip._assetType,
        cache: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      bg="elv-gray.4"
      p="16 12"
    >
      <Flex align="center" gap={16} mb={8}>
        {
          searchStore.selectedSearchResult?._caption ?
            (
              <Box w="100%">
                {
                  editEnabled ?
                    <CaptionEditView
                      CancelEdit={() => setEditEnabled(false)}
                      HandleReload={HandleReload}
                    /> :
                    <CaptionDisplayView
                      title={clip._info_image?.Headline || clip._title}
                      HandleReload={HandleReload}
                      editEnabled={editEnabled}
                      setEditEnabled={setEditEnabled}
                    />
                }
              </Box>
            ) :
            (
              <Flex justify="center" mb={16} mt={12}>
                {
                  loading ? <Loader /> :
                    (
                      <Button
                        onClick={async() => {
                          try {
                            setLoading(true);

                            await summaryStore.GetCaptionResults({
                              objectId: clip.id,
                              fileName: clip._title
                            });
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Generate Caption
                      </Button>
                    )
                }
              </Flex>
            )
        }
      </Flex>
    </Paper>
  );
});

const SummarySection = observer(({clip}) => {
  const [loadingSummary, setLoadingSummary] = useState(false);

  return (
    <TextCard
      title={searchStore.selectedSearchResult?._summary ? searchStore.selectedSearchResult?._summary?.title || "Summary" : ""}
      text={searchStore.selectedSearchResult?._summary?.summary || ""}
      lineClamp={15}
      topActions={searchStore.selectedSearchResult?._summary ? [
        {
          text: "Regenerate Summary",
          onClick: async () => {
            try {
              setLoadingSummary(true);
              searchStore.UpdateSelectedSearchResult({key: "_summary", value: null});

              await summaryStore.GetSummaryResults({
                objectId: clip.id,
                startTime: clip.start_time,
                endTime: clip.end_time,
                prefix: clip.prefix,
                assetType: clip._assetType,
                cache: false
              });
            } finally {
              setLoadingSummary(false);
            }
          }
        }
      ] : []}
    >
      {
        !searchStore.selectedSearchResult?._summary &&
        (
          <Flex justify="center" mb={16} mt={12}>
            {
              loadingSummary ? <Loader /> :
                (
                  <Button
                    onClick={async() => {
                      try {
                        setLoadingSummary(true);

                        await summaryStore.GetSummaryResults({
                          objectId: clip.id,
                          startTime: clip.start_time,
                          endTime: clip.end_time,
                          prefix: clip.prefix,
                          assetType: clip._assetType,
                        });
                      } finally {
                        setLoadingSummary(false);
                      }
                    }}
                  >
                    Generate Summary
                  </Button>
                )
            }
          </Flex>
        )
      }
    </TextCard>
  );
});

const AIContentSection = observer(({clip, mediaType}) => {
  const CONTENT_TYPES = {
    "MUSIC": null,
    "VIDEO": <SummarySection clip={clip} />,
    "IMAGE": <CaptionSection clip={clip} />
  };

  return CONTENT_TYPES[mediaType];
});

export default AIContentSection;
