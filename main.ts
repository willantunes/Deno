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
}

let processes: Process[] = [];
let currentId = 1;

console.log("Servidor HTTP rodando. Acesse em: http://localhost:8080/");

serve(async (req) => {
  
  const url = 
  new URL(req.url);
  const pathname = url.pathname;
  console.log('Recebida solicitação: ${req.method} ${pathname}');

  // Rota para listar todos os processos
  if (pathname === "/api/processes" && req.method === "GET") {
    console.log("Listando todos os processos");
    return new Response(JSON.stringify(processes), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Rota para criar um novo processo
  if (pathname === "/api/processes" && req.method === "POST") {
    try {
      const body = await req.json();
      console.log("Corpo recebido para POST:", body);
      const { name, version, objective, owner, users, status } = body;
      const createdAt = new Date().toISOString();
      const createdBy = owner;

      const newProcess: Process = {
        id: currentId++,
        name,
        version,
        objective,
        owner,
        users,
        status,
        createdAt,
        createdBy
      };

      processes.push(newProcess);

      console.log("Processo criado:", newProcess);
      return new Response(JSON.stringify(newProcess), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Erro ao criar processo:", error);
      return new Response(JSON.stringify({ message: "Erro ao criar processo" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // Rota para operações em processos específicos por ID
  if (pathname.startsWith("/api/processes/")) {
    const idStr = pathname.replace("/api/processes/", "");
    const id = parseInt(idStr);
    if (!isNaN(id)) {
      if (req.method === "GET") {
        console.log('Obtendo detalhes do processo com ID: ${id}');
        const process = processes.find(p => p.id === id);
        if (process) {
          return new Response(JSON.stringify(process), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({ message: "Processo não encontrado" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
        }
      }

      if (req.method === "PUT") {
        console.log('Atualizando processo com ID: ${id}');
        const index = processes.findIndex((process) => process.id === id);
        const body = await req.json();
        console.log("Corpo recebido para PUT:", body);
        const { name, version, objective, owner, users, status } = body;
        const updatedAt = new Date().toISOString();
        const updatedBy = owner;

        if (index !== -1) {
          // Atualiza o processo existente
          processes[index] = {
            ...processes[index],
            name,
            version,
            objective,
            owner,
            users,
            status,
            updatedAt,
            updatedBy
          };
          console.log("Processo atualizado:", processes[index]);
          return new Response(JSON.stringify(processes[index]), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({ message: "Processo não encontrado" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
        }
      }

      if (req.method === "DELETE") {
        console.log('Deletando processo com ID: ${id}');
        const index = processes.findIndex((process) => process.id === id);
        if (index !== -1) {
          processes.splice(index, 1);
          console.log("Processo deletado");
          return new Response(JSON.stringify({ message: "Processo deletado" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } else {
          return new Response(JSON.stringify({ message: "Processo não encontrado" }), {
            status: 404,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  }

  // Servindo arquivos estáticos
  console.log("Servindo arquivos estáticos");
  return serveDir(req, {
    fsRoot: ".",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });

}, { port: 8080 });