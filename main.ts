import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleProcessRequest } from "./processes.ts";
import { handleRiskRequest } from "./risks.ts";
import { serveDir } from "https://deno.land/std@0.224.0/http/file_server.ts";

console.log("Servidor HTTP rodando. Acesse em: http://localhost:8080/");

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  console.log(`Recebida solicitação: ${req.method} ${pathname}`);

  if (pathname.startsWith("/api/processes")) {
    return await handleProcessRequest(req);
  }

  if (pathname.startsWith("/api/risks")) {
    return await handleRiskRequest(req);
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
