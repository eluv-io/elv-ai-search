import {observer} from "mobx-react-lite";
import {Box} from "@mantine/core";
import {useEffect, useState} from "react";
import {contentStore, rootStore} from "@/stores/index.js";
import ContentList from "@/pages/search/content/ContentList.jsx";

const Content = observer(({show}) => {
  const [content, setContent] = useState([]);
  const [paging, setPaging] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const LoadData = async() => {
      try {
        setLoading(true);
        const contentMetadata = await contentStore.GetContentData({
          filterByFolder: false,
          parentFolder: rootStore.tenantStore.rootFolder
        });

        setContent(contentMetadata.content);
        setPaging(contentMetadata.paging);
      } finally {
        setLoading(false);
      }
    };

    if(rootStore.tenantStore.rootFolder) {
      LoadData();
    }
  }, [rootStore.tenantStore.rootFolder]);

  if(!show) { return null; }

  return (
    <Box>
      <ContentList
        records={content}
        paging={paging}
        loading={loading}
      />
    </Box>
  );
});

export default Content;
