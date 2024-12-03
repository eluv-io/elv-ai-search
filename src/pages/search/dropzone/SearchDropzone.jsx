import {Dropzone, IMAGE_MIME_TYPE} from "@mantine/dropzone";
import {Button, Flex, Stack, Text} from "@mantine/core";
import {UploadIcon} from "@/assets/icons/index.js";
import {searchStore} from "@/stores/index.js";
import {observer} from "mobx-react-lite";

const SearchDropzone = observer(({loadingSearch}) => {
  // const [files, setFiles] = useState([]);

  if(loadingSearch) { return null; }

  return (
    <Flex justify="center">
      <Dropzone
        // onDrop={setFiles}
        accept={IMAGE_MIME_TYPE}
        w={400}
      >
        <Flex justify="center" p="65 70">
          <Stack justify="center" gap={0} align="center">
            <UploadIcon color="elv-gray.3" mb={4} />
            <Text c="elv-gray.3" size="xs" mb={2}>Drag a file (image, video, or audio)</Text>
            <Button variant="transparent" p={0} h="fit-content" size="xs">Upload a File</Button>
          </Stack>
        </Flex>
      </Dropzone>
    </Flex>
  );
});

export default SearchDropzone;
