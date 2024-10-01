import {observer} from "mobx-react-lite";
import {uiStore} from "@/stores";
import {ActionIcon, Box, CloseIcon, Flex, Text} from "@mantine/core";

const ErrorBanner = observer(() => {
  if(!uiStore.errorMessage) { return null; }

  return (
    <Flex align="center" justify="space-between" bg="elv-gray.8" p="12px 50px 12px 26px">
      <Box>
        <Text fw={500} c="elv-neutral.0" size="sm" lh={1}>
          { uiStore.errorMessage }
        </Text>
      </Box>
      <ActionIcon size="sm" onClick={() => uiStore.SetErrorMessage(undefined)}>
        <CloseIcon />
      </ActionIcon>
    </Flex>
  );
});

export default ErrorBanner;
