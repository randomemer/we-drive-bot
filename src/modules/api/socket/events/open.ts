import type WebSocket from "ws";

export default function onOpen(socket: WebSocket, token: string) {
  socket.addEventListener("open", async () => {
    const data = {
      event: "auth",
      args: [token],
    };

    socket.send(JSON.stringify(data));
  });
}
