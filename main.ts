import { Application, Router } from "https://deno.land/x/oak@v16.1.0/mod.ts";

const connectedClients = new Map();

const app = new Application();
// read from environment variable or default to 8080
const port = parseInt(Deno.env.get("PORT") || "8080");
const router = new Router();

// send a message to all connected clients
function broadcast(message: string) {
  for (const client of connectedClients.values()) {
    client.send(message);
  }
}

// send updated users list to all connected clients
function broadcast_usernames() {
  const usernames = [...connectedClients.keys()];
  console.log(
    "Sending updated username list to all clients: " +
      JSON.stringify(usernames),
  );
  broadcast(
    JSON.stringify({
      event: "update-users",
      usernames: usernames,
    }),
  );
}

type CustomSocket = WebSocket & { send: (data: string) => void, username?: string | null };

router.get("/start_web_socket", async (ctx) => {
  const socket: CustomSocket = await ctx.upgrade();
  const username = ctx.request.url.searchParams.get("username");
  if (connectedClients.has(username)) {
    socket.close(1008, `Username ${username} is already taken`);
    return;
  }
  socket.username = username;
  connectedClients.set(username, socket);
  console.log(`New client connected: ${username}`);

  // broadcast the active users list when a new user logs in
  socket.onopen = () => {
    broadcast_usernames();
  };

  // when a client disconnects, remove them from the connected clients list
  // and broadcast the active users list
  socket.onclose = () => {
    console.log(`Client ${socket.username} disconnected`);
    connectedClients.delete(socket.username);
    broadcast_usernames();
  };

  // broadcast new message if someone sent one
  socket.onmessage = (m) => {
    const data = JSON.parse(m.data);
    switch (data.event) {
      case "send-message":
        broadcast(
          JSON.stringify({
            event: "send-message",
            username: socket.username,
            message: data.message,
          }),
        );
        break;
    }
  };
});

app.use(router.routes());
app.use(router.allowedMethods());
app.use(async (context) => {
  await context.send({
    root: `${Deno.cwd()}/`,
    index: "public/index.html",
  });
});

function generateFrontendEnvironmentVariables () {
  // write file ./public/generated.js
  const env = Deno.env.toObject();
  // const envContent = `window.env = ${JSON.stringify(env)};`;
  const envContent = `
window.mapboxToken = "${env.MAPBOX_TOKEN}";
window.appPort = ${port};
`;
  Deno.writeTextFileSync("./public/generated.js", envContent);
}

console.log("Listening at https://localhost:" + port);
await app.listen({ port });