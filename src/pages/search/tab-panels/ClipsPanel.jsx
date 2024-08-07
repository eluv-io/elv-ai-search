import {observer} from "mobx-react-lite";
import {AspectRatio, Image, SimpleGrid} from "@mantine/core";
import {NavLink} from "react-router-dom";

const ClipsPanel = observer(({results=[]}) => {
  return (
    <SimpleGrid cols={4} spacing="lg">
      {
        results.map(({image_url, id}) => (
          <NavLink to={`${id}`} key={`grid-item-${id}`}>
            <AspectRatio ratio={16 / 9}>
              <Image
                radius="lg"
                src={image_url}
              />
            </AspectRatio>
          </NavLink>
        ))
      }
    </SimpleGrid>
  );
});

export default ClipsPanel;
