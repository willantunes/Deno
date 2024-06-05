import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

interface Risk {
  id: number;
  description: string;
  probability: number;
  impact: number;
  status: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  updatedBy?: string;
}

let risks: Risk[] = [];
let currentRiskId = 1;

export async function handleRiskRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const pathname = url.pathname;

  if (pathname === "/api/risks" && req.method === "GET") {
    return new Response(JSON.stringify(risks), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (pathname === "/api/risks" && req.method === "POST") {
    const body = await req.json();
    const { description, probability, impact, status, createdBy } = body;
    const newRisk = {
      id: currentRiskId++,
      description,
      probability,
      impact,
      status,
      createdAt: new Date().toISOString(),
      createdBy,
    };
    risks.push(newRisk);
    return new Response(JSON.stringify(newRisk), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (pathname.startsWith("/api/risks/")) {
    const id = parseInt(pathname.replace("/api/risks/", ""));
    if (!isNaN(id)) {
      const risk = risks.find(r => r.id === id);
      if (!risk) {
        return new Response(JSON.stringify({ message: "Risco não encontrado" }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (req.method === "GET") {
        return new Response(JSON.stringify(risk), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (req.method === "PUT") {
        const body = await req.json();
        const { description, probability, impact, status, updatedBy } = body;
        Object.assign(risk, {
          description, probability, impact, status, updatedAt: new Date().toISOString(),
          updatedBy
        });
        return new Response(JSON.stringify(risk), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      }
      if (req.method === "DELETE") {
        const index = risks.findIndex((r) => r.id === id);
        if (index !== -1) {
          risks.splice(index, 1);
          return new Response(JSON.stringify({ message: "Risco deletado" }), {
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
}
