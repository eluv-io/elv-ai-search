import {Group} from "@mantine/core";
import {ArrowLeftIcon, ArrowRightIcon} from "@/assets/icons/index.js";
import {useNavigate} from "react-router-dom";
import SecondaryButton from "@/components/secondary-action-icon/SecondaryActionIcon.jsx";

const VideoDetailsTopToolbar = () => {
  const navigate = useNavigate();

  return (
    <Group mb={24} ml={24} gap={39}>
      <SecondaryButton
        size="lg"
        iconOnly
        Icon={ArrowLeftIcon}
        onClick={() => navigate("/search", {state: {persistSearchResults: true}})}
      />

      <Group gap={12}>
        <SecondaryButton LeftIcon={ArrowLeftIcon}>
          Previous
        </SecondaryButton>
        <SecondaryButton LeftIcon={ArrowRightIcon}>
          Next
        </SecondaryButton>
      </Group>
    </Group>
  );
};

export default VideoDetailsTopToolbar;
