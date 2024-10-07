import {ActionIcon, Button, HoverCard, Text} from "@mantine/core";
import {forwardRef} from "react";

const SecondaryButton = forwardRef(({
  onClick,
  children,
  Icon,
  LeftIcon,
  iconOnly=false,
  iconColor,
  hoverText,
  ...props
}, ref) => {
  let iColor="var(--mantine-color-elv-neutral-5)";
  if (iconColor) {
    iColor = iconColor;
  }

  let target

  if(iconOnly) {
    if(!Icon && !children) { throw Error("Icon must be provided when using iconOnly"); }

    target = (
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
    target = (
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

  if (hoverText) {
    return (
      <HoverCard>
        <HoverCard.Target>
          { target }
        </HoverCard.Target>
        <HoverCard.Dropdown>
          <Text size="sm">{ hoverText }</Text>
        </HoverCard.Dropdown>
      </HoverCard>
    )
  } else {
    return target
  }
});

SecondaryButton.displayName = "SecondaryButton";

export default SecondaryButton;
