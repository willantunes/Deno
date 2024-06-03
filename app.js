document.addEventListener('DOMContentLoaded', async () => {
    // Função para carregar a lista de processos
    const loadProcesses = async () => {
      const response = await fetch('/api/processes/');
      if (response.ok) {
        const processes = await response.json();
        const processTable = document.getElementById('processTable');
        processTable.innerHTML = processes.map(process => `
          <tr>
            <td class="py-2 px-4 border-b">${process.id}</td>
            <td class="py-2 px-4 border-b">${process.name}</td>
            <td class="py-2 px-4 border-b">${process.version}</td>
            <td class="py-2 px-4 border-b">${process.objective}</td>
            <td class="py-2 px-4 border-b">
              <a href="edit.html?id=${process.id}" class="text-blue-600 hover:underline">Editar</a>
            </td>
          </tr>
        `).join('');
      } else {
        console.error('Falha ao buscar processos');
      }
    };
  
    // Função para adicionar um novo processo
    const addProcess = async (process) => {
      const response = await fetch('/api/processes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(process),
      });
      if (response.ok) {
        loadProcesses();
      } else {
        console.error('Falha ao adicionar processo');
      }
    };
  
    // Inicializa a lista de processos na página de listagem
    if (document.getElementById('processTable')) {
      loadProcesses();
    }
  
    // Inicializa o formulário de edição na página de edição
    if (document.getElementById('editForm')) {
      const urlParams = new URLSearchParams(window.location.search);
      const processId = urlParams.get('id');
      if (processId) {
        fetch(`/api/processes/${processId}`)
          .then(response => response.json())
          .then(process => {
            document.getElementById('processId').value = process.id;
            document.getElementById('name').value = process.name;
            document.getElementById('version').value = process.version;
            document.getElementById('objective').value = process.objective;
            document.getElementById('owner').value = process.owner;
            document.getElementById('users').value = process.users.join(', ');
            document.getElementById('status').value = process.status;
          })
          .catch(error => {
            console.error('Falha ao buscar processo', error);
          });
      }
  
      document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const processId = document.getElementById('processId').value;
        const data = {
          name: document.getElementById('name').value,
          version: document.getElementById('version').value,
          objective: document.getElementById('objective').value,
          owner: document.getElementById('owner').value,
          users: document.getElementById('users').value.split(',').map(user => user.trim()),
          status: document.getElementById('status').value,
        };
        const method = processId ? 'PUT' : 'POST';
        const url = processId ? '/api/processes/${processId}' : '/api/processes/';
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
        if (response.ok) {
          alert('Processo atualizado com sucesso');
          window.location.href = 'index.html';
        } else {
          alert('Falha ao atualizar o processo');
        }
      });
    }
  });
  