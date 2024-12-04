import {useEffect, useRef, useState} from "react";
import {reaction} from "mobx";
import {observer} from "mobx-react-lite";
import {videoStore, overlayStore} from "@/stores/index.js";
import {Flex, Tooltip} from "@mantine/core";

const Overlay = observer(({
  element
}) => {
  const [hoverEntries, setHoverEntries] = useState([]);
  const [dimensions, setDimensions] = useState({width: 0, height: 0});

  const [DisposeDrawReaction, setDisposeDrawReaction] = useState(null);

  const canvasRef = useRef(null);
  const boxRef = useRef(null);

  let lastUpdate, resizeUpdate, resizeObserver;
  let isMounted = false;

  const Draw = ({entry}={}) => {
    if(!canvasRef?.current) { return; }

    let {x1, x2, x3, x4, y1, y2, y3, y4} = overlayStore.coordinates;
    const {width, height} = dimensions;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;

    // Draw
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;
    ctx.lineWidth = 3;

    entry.color = {
      r: 200,
      g: 200,
      b: 50,
      a: 150
    };

    if(!x1 || !y1) {
      ({x1, x2, y1, y2, x3, y3, x4, y4} = entry.box);
    }

    let points = [];
    if(!x3) {
      points = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]];
    } else {
      points = [[x1, y1], [x2, y2], [x3, y3], [x4, y4]];
    }
    points = points.map(point => [point[0] * width, point[1] * height]);

    const toHex = n => n.toString(16).padStart(2, "0");

    // ctx.strokeStyle = `#${toHex(entry.color.r)}${toHex(entry.color.g)}${toHex(entry.color.b)}`;
    ctx.strokeStyle = "#BD6DFF";

    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    ctx.lineTo(points[1][0], points[1][1]);
    ctx.lineTo(points[2][0], points[2][1]);
    ctx.lineTo(points[3][0], points[3][1]);
    ctx.lineTo(points[0][0], points[0][1]);
    ctx.stroke();

    setHoverEntries([
      entry
    ]);
  };

  useEffect(() => {
    // Observe resizing of the video element to adjust the overlay size accordingly
    const ObserveSizing = () => {
      const debounceInterval = 100;

      // Add resize observer for overlay component
      resizeObserver = new ResizeObserver(
        elements => {
          // Debounce resize updates
          if(lastUpdate && (performance.now() - lastUpdate) < debounceInterval) {
            clearTimeout(resizeUpdate);
          }

          resizeUpdate = setTimeout(() => {
            const video = elements[0].target;
            let {height, width} = elements[0].contentRect;

            const videoAspectRatio = video.videoWidth / video.videoHeight;
            const elementAspectRatio = width / height;

            // Since the video element is pegged to 100% height, when the AR of the
            // video element becomes taller than the video content, they no longer match.
            // Calculate the actual video height using the reported aspect ratio of the content.
            if(elementAspectRatio < videoAspectRatio) {
              height = width / videoAspectRatio;
            }

            if(isMounted) {
            }
          }, debounceInterval);

          lastUpdate = performance.now();
        }
      );

      resizeObserver?.observe(element);
    };

    const InitData = () => {
      isMounted = true;

      const DrawReactionCallback = reaction(
        () => {
          return ({
            activeTrack: overlayStore.activeTrack,
            enabled: overlayStore.overlayEnabled,
            frame: videoStore.frame
          });
        },
        () => Draw(),
        {
          delay: 25,
          equals: (from, to) => JSON.stringify(from) === JSON.stringify(to)
        }
      );

      setDisposeDrawReaction(DrawReactionCallback);
    };

    // ObserveSizing();
    InitData();

    return () => {
      isMounted = false;

      if(DisposeDrawReaction) {
        DisposeDrawReaction();
      }
    };
  }, []);

  useEffect(() => {
    if(boxRef.current) {
      const observer = new ResizeObserver((entries) => {
        for(let entry of entries) {
          const {width, height} = entry.contentRect;
          setDimensions({width, height});
        }
      });

      observer.observe(boxRef.current);

      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    if(overlayStore.entry === undefined) {
      return;
    } else {
      Draw({entry: overlayStore.entry});
    }
  }, [overlayStore.entry]);

  const TooltipContent = () => {
    if(
      // !hovering ||
      hoverEntries.length === 0
    ) {
      return null;
    }

    return (
      <div className="track-entry-container">
        {
          hoverEntries.map((entry, i) =>
            <div className="track-entry" key={`overlay-hover-entry-${i}`}>
              <div className="track-entry-content">
                { Array.isArray(entry.text) ? entry.text.join(", ") : entry.text }
              </div>
            </div>
          )
        }
      </div>
    );
  };

  // if(!asset && !overlayStore.overlayEnabled) { return null; }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      w="100%"
      h="100%"
      style={{zIndex: 500}}
      pos="absolute"
      ref={boxRef}
    >
      <Tooltip.Floating label={TooltipContent()}>
        <canvas
          key={overlayStore.pageVersion}
          // onClick={Click}
          ref={canvasRef}
          // style={{height: "100%", width: "100%"}}
        />
      </Tooltip.Floating>
    </Flex>
  );
});

export default Overlay;
