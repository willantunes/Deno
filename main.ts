import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";


interface Process {
  id: number;
  name: string;
  version: string;
  objective: string;
  owner: string;
  users: string[];
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
  diagramXML?: string;
}

let processes: Process[] = [];
let currentId = 1;


console.log("Servidor HTTP rodando. Acesse em: http://localhost:8080/");

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  console.log(`Recebida solicitação: ${req.method} ${pathname}`);

  if (pathname === "/api/processes" && req.method === "GET") {
    return new Response(JSON.stringify(processes), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (pathname === "/api/processes" && req.method === "POST") {
    const body = await req.json();
    const { name, version, objective, owner, users, status, diagramXML } = body;
    const newProcess = {
      id: currentId++,
      name,
      version,
      objective,
      owner,
      users,
      status,
      createdAt: new Date().toISOString(),
      createdBy: owner,
      diagramXML
    };
    processes.push(newProcess);
    return new Response(JSON.stringify(newProcess), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (pathname.startsWith("/api/processes/")) {
    const id = parseInt(pathname.replace("/api/processes/", ""));
    if (!isNaN(id)) {
      const process = processes.find(p => p.id === id);
      if (!process) {
        return new Response(JSON.stringify({ message: "Processo não encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (req.method === "GET") {
        return new Response(JSON.stringify(process), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (req.method === "PUT") {
        const body = await req.json();
        const { name, version, objective, owner, users, status, diagramXML } = body;
        Object.assign(process, {
          name, version, objective, owner, users, status, updatedAt: new Date().toISOString(),
          updatedBy: owner, diagramXML
        });
        return new Response(JSON.stringify(process), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (req.method === "DELETE") {
        const index = processes.findIndex((p) => p.id === id);
        if (index !== -1) {
          processes.splice(index, 1);
          return new Response(JSON.stringify({ message: "Processo deletado" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }

  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
}, { port: 8080 });
