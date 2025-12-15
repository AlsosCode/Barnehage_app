import React from "react";

let VideoImpl: React.ComponentType<any> | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoVideo = require('expo-video');
  if (expoVideo?.Video) {
    VideoImpl = expoVideo.Video;
  }
} catch {
  // ignore
}

if (!VideoImpl) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoAv = require('expo-av');
  VideoImpl = expoAv.Video;
}

type Props = any;

export default function VideoPlayer(props: Props) {
  const merged = {
    ...props,
    nativeControls: props.nativeControls ?? props.useNativeControls,
  };
  return VideoImpl ? <VideoImpl {...merged} /> : null;
}
