import TiptapCollaboration from "@tiptap/extension-collaboration";
import TiptapCursor from "@tiptap/extension-collaboration-cursor";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import YProvider from "y-partykit/provider";
import * as Y from "yjs";

// const partykitHost = "localhost:1999"
// const partykitHost = "yjs.threepointone.partykit.dev/party";

export function useConnection({ yProvider }: { yProvider: YProvider }) {
  useEffect(() => {
    yProvider.connect();
    return () => yProvider.disconnect();
  }, [yProvider]);
}

type ConnectionStatus = "disconnected" | "connecting" | "connected";
export function useConnectionStatus({ yProvider }: { yProvider: YProvider }) {
  const [state, setState] = useState<ConnectionStatus>("disconnected");
  yProvider.on("status", (event: { status: ConnectionStatus }) => {
    setState(event.status);
  });
  return state;
}

const colors = [
  "#958DF1",
  "#F98181",
  "#FBBC88",
  "#FAF594",
  "#70CFF8",
  "#94FADB",
  "#B9F18D",
];

export const getRandomColor = () =>
  colors[Math.floor(Math.random() * colors.length)];
