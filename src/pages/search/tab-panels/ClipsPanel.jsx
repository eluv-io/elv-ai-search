import {observer} from "mobx-react-lite";
import {AspectRatio, Image, SimpleGrid} from "@mantine/core";
import {NavLink} from "react-router-dom";

const ClipsPanel = observer(({items=[]}) => {
  items = [];

  return (
    <SimpleGrid cols={4} spacing="lg">
      {
        items.map(({src, path}) => (
          <NavLink to={path} key={`grid-item-$${path}`}>
            <AspectRatio ratio={16 / 9}>
              <Image
                radius="lg"
                src={src}
              />
            </AspectRatio>
          </NavLink>
        ))
      }
    </SimpleGrid>
  );
});

export default ClipsPanel;
