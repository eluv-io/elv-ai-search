import {ActionIcon, Button, Group, Text} from "@mantine/core";
import {ArrowLeftIcon, ArrowRightIcon} from "@/assets/icons/index.js";
import {useNavigate} from "react-router-dom";

const VideoDetailsTopToolbar = ({buttonStyles, iconStyles, textStyles}) => {
  const navigate = useNavigate();

  return (
    <Group mb={24} ml={24} gap={39}>
      <ActionIcon
        size="lg"
        onClick={() => navigate(-1)}
        {...buttonStyles}
      >
        <ArrowLeftIcon {...iconStyles} />
      </ActionIcon>

      <Group gap={12}>
        <Button
          {...buttonStyles}
          leftSection={<ArrowLeftIcon {...iconStyles} />}
        >
          <Text {...textStyles}>Previous</Text>
        </Button>
        <Button
          {...buttonStyles}
          leftSection={<ArrowRightIcon {...iconStyles} />}
        >
          <Text {...textStyles}>Next</Text>
        </Button>
      </Group>
    </Group>
  );
};

export default VideoDetailsTopToolbar;
