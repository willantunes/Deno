import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { readAll } from "https://deno.land/std@0.224.0/io/read_all.ts";

interface Process {
  id: number;
  name: string;
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

console.log(`HTTP webserver running. Access it at: http://localhost:8080/`);

serve(async (req) => {
  const url = new URL(req.url, `http://localhost:8080`);

  if (url.pathname === "/processes" && req.method === "GET") {
    return new Response(JSON.stringify(processes), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } else if (url.pathname === "/processes" && req.method === "POST") {
    try {
      const body = await req.text();
      console.log("Received body:", body);
      const data = JSON.parse(body);
      const { name, objective, owner, users, status } = data;
      const createdAt = new Date().toISOString();
      const createdBy = owner;

      const newProcess: Process = {
        id: currentId++,
        name,
        objective,
        owner,
        users,
        status,
        createdAt,
        createdBy
      };

      processes.push(newProcess);
      return new Response(JSON.stringify(newProcess), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (error) {
      console.error("Error in POST /processes:", error.message);
      console.error("Stack trace:", error.stack);
      return new Response(JSON.stringify({ message: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  } else if (url.pathname.startsWith("/edit") && req.method === "GET") {
    try {
      const html = await Deno.readTextFile("./edit.html");
      return new Response(html, {
        status: 200,
        headers: { "Content-Type": "text/html" }
      });
    } catch (error) {
      console.error("Error reading HTML file:", error.message);
      console.error("Stack trace:", error.stack);
      return new Response("Internal Server Error", { status: 500 });
    }
  } else if (url.pathname.match(/\/processes\/\d+/) && req.method === "PUT") {
    const id = parseInt(url.pathname.split("/")[2]);
    const index = processes.findIndex((process) => process.id === id);
    if (index !== -1) {
      try {
        const body = await req.text();
        console.log("Received body for update:", body);
        const data = JSON.parse(body);
        const { name, objective, owner, users, status } = data;
        const updatedAt = new Date().toISOString();
        const updatedBy = owner;

        processes[index] = {
          ...processes[index],
          name,
          objective,
          owner,
          users,
          status,
          updatedAt,
          updatedBy
        };
        return new Response(JSON.stringify(processes[index]), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        console.error("Error in PUT /processes/:id:", error.message);
        console.error("Stack trace:", error.stack);
        return new Response(JSON.stringify({ message: "Internal Server Error" }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      return new Response(JSON.stringify({ message: "Process not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
  } else {
    return new Response("Not Found", { status: 404 });
  }
}, { port: 8080 });
