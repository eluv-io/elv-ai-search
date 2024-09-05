import {ActionIcon, Button, Text} from "@mantine/core";
import {forwardRef} from "react";

const SecondaryButton = forwardRef(({
  onClick,
  children,
  Icon,
  LeftIcon,
  iconOnly=false,
  iconColor,
  ...props
}, ref) => {
  let iColor="var(--mantine-color-elv-neutral-5)";
  if (iconColor) {
    iColor = iconColor;
  }

  if(iconOnly) {
    if(!Icon && !children) { throw Error("Icon must be provided when using iconOnly"); }

    return (
      <ActionIcon
        onClick={onClick}
        radius={30}
        color="elv-gray.1"
        {...props}
        ref={ref}
      >
        {
          Icon ?
            <Icon color={iColor} /> :
            children
        }
      </ActionIcon>
    );
  } else {
    return (
      <Button
        leftSection={LeftIcon ? <LeftIcon color={iColor} /> : null}
        radius={30}
        color="elv-gray.1"
        onClick={onClick}
        {...props}
      >
        <Text c="elv-neutral.5" fw={600} size="sm">
          { children }
        </Text>
      </Button>
    );
  }
});

SecondaryButton.displayName = "SecondaryButton";

export default SecondaryButton;
