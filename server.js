const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
  maxHttpBufferSize: 2e5
});

const PORT = process.env.PORT || 3000;
const MAX_PLAYERS = 5;
const HOST_TIMEOUT_MS = 4500; // host sem enviar o estado do mundo por esse tempo perde o posto
const rooms = new Map();

// Tudo fica na raiz: só o index.html do jogo é entregue (server.js e package.json não ficam expostos).
const INDEX = path.join(__dirname, "index.html");
app.get("/", (_req, res) => res.sendFile(INDEX));
app.get("/index.html", (_req, res) => res.sendFile(INDEX));
app.get("/health", (_req, res) => res.json({ ok: true, rooms: rooms.size }));

function cleanPresence(value) {
  if (!value || typeof value !== "object") return {};
  const out = {};
  const allowed = ["h", "nm", "al", "go", "st", "dead", "hp", "mhp", "lv",
    "x", "y", "say", "sy", "rv", "run", "t", "gold", "kills", "sk"];
  for (const key of allowed) {
    if (!(key in value)) continue;
    const v = value[key];
    if (typeof v === "number" && Number.isFinite(v)) out[key] = Math.max(-1e7, Math.min(1e7, v));
    else if (typeof v === "string") out[key] = v.replace(/[\u0000-\u001f<>]/g, "").slice(0, 40);
    else if (typeof v === "boolean" || v === null) out[key] = v;
    else if (Array.isArray(v)) out[key] = v.slice(0, 4);
  }
  return out;
}

function snapshot(room) {
  return [...room.members].map(([id, presence]) => ({ peer: id, presence }));
}
function broadcastRoom(roomName) {
  const room = rooms.get(roomName);
  if (!room) return;
  io.to(roomName).emit("room:peers", snapshot(room), room.host || null);
}

// O host é quem simula os monstros. Continua o mesmo enquanto estiver na partida (al = 1).
// Se sair, parar de responder ou voltar ao menu, o próximo jogador da partida assume.
function electHost(room, avoid) {
  const inMatch = id => {
    const p = room.members.get(id);
    return p && p.al === 1 && id !== avoid;
  };
  if (room.host && inMatch(room.host)) return false;
  const old = room.host || null;
  let next = null;
  for (const id of room.members.keys()) if (inMatch(id)) { next = id; break; }
  room.host = next;
  room.lastWorld = Date.now();
  return old !== next;
}
function removeFromRoom(socket) {
  const roomName = socket.data.roomName;
  if (!roomName) return;
  const room = rooms.get(roomName);
  if (room) {
    room.members.delete(socket.id);
    if (room.members.size === 0) rooms.delete(roomName);
    else { electHost(room); broadcastRoom(roomName); }
  }
  socket.leave(roomName);
  socket.data.roomName = null;
}

io.on("connection", socket => {
  socket.on("room:join", (rawName, callback) => {
    const roomName = String(rawName || "").toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40);
    if (!roomName) return callback?.({ ok: false, error: "Código de sala inválido." });
    if (socket.data.roomName) removeFromRoom(socket);
    let room = rooms.get(roomName);
    if (!room) {
      room = { members: new Map(), host: null, lastWorld: 0 };
      rooms.set(roomName, room);
    }
    if (room.members.size >= MAX_PLAYERS) {
      return callback?.({ ok: false, error: "Sala cheia (máximo 5 jogadores)." });
    }
    socket.join(roomName);
    socket.data.roomName = roomName;
    room.members.set(socket.id, {});
    callback?.({ ok: true, id: socket.id, peers: snapshot(room), host: room.host || null });
    broadcastRoom(roomName);
  });

  socket.on("room:presence", patch => {
    const roomName = socket.data.roomName;
    const room = roomName && rooms.get(roomName);
    if (!room || !room.members.has(socket.id)) return;
    const previous = room.members.get(socket.id) || {};
    const clean = cleanPresence(patch);
    const next = { ...previous, ...clean };
    room.members.set(socket.id, next);
    // mudança de membership da partida (al/host): manda a lista completa; senão só o pedaço novo
    if ("al" in clean && clean.al !== previous.al) {
      electHost(room);
      broadcastRoom(roomName);
    } else {
      socket.to(roomName).emit("room:patch", socket.id, clean);
    }
  });

  // Canal do mundo compartilhado. "net:v" é volátil (estado que se refaz logo em seguida),
  // "net:r" é confiável (mortes, dano, vitória).
  const relay = (volatile) => (payload) => {
    const roomName = socket.data.roomName;
    const room = roomName && rooms.get(roomName);
    if (!room || !payload || typeof payload !== "object") return;
    if (payload.t === "s") {
      if (room.host !== socket.id) return; // só o host manda o estado do mundo
      room.lastWorld = Date.now();
    }
    const target = socket.to(roomName);
    (volatile ? target.volatile : target).emit(volatile ? "net:v" : "net:r", socket.id, payload);
  };
  socket.on("net:v", relay(true));
  socket.on("net:r", relay(false));

  socket.on("room:leave", () => removeFromRoom(socket));
  socket.on("disconnect", () => removeFromRoom(socket));
});

// Se o host congelar (aba em segundo plano, celular bloqueado), passa o posto adiante.
setInterval(() => {
  const now = Date.now();
  for (const [name, room] of rooms) {
    if (!room.host || now - room.lastWorld < HOST_TIMEOUT_MS) continue;
    const stale = room.host;
    const others = [...room.members].filter(([id, p]) => id !== stale && p.al === 1);
    if (!others.length) { room.lastWorld = now; continue; }
    electHost(room, stale);
    broadcastRoom(name);
  }
}, 1000);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Vagalume multiplayer rodando em http://localhost:${PORT}`);
});
