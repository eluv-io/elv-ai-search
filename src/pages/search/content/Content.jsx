import {observer} from "mobx-react-lite";
import {Box} from "@mantine/core";
import {useEffect, useState} from "react";
import {contentStore, rootStore} from "@/stores/index.js";
import ContentList from "@/pages/search/content/ContentList.jsx";

const Content = observer(({show}) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);
        const contentMetadata = await contentStore.GetContentFolders({
          parentFolder: rootStore.tenantStore.rootFolder
        });

        setContent(contentMetadata);
      } finally {
        setLoading(false);
      }
    };

    LoadData();
  }, [rootStore.tenantStore.rootFolder]);

  if(!show) { return null; }

  return (
    <Box>
      <ContentList
        records={content}
        loading={loading}
      />
    </Box>
  );
});

export default Content;
