var urlForFetch = '';
var method = '';
var modeler = new BpmnJS({
  container: '#diagram',
  keyboard: {
    bindTo: window
  },
  additionalModules: [
    // Assuming you import these modules where required
    // E.g., BpmnPropertiesPanelModule,
    // E.g., BpmnPropertiesProviderModule,
    // Add other modules here as needed for full capabilities
  ],
  propertiesPanel: {
    parent: '#properties-panel' // Make sure this div exists in your HTML
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const processId = urlParams.get('id');

  if (processId) {
    urlForFetch = `/api/processes/${processId}`;
    method = 'PUT';
    document.getElementById('processId').value = processId;
    const response = await fetch(urlForFetch);
    if (response.ok) {
      const process = await response.json();
      document.getElementById('name').value = process.name;
      document.getElementById('version').value = process.version;
      document.getElementById('objective').value = process.objective;
      document.getElementById('owner').value = process.owner;
      document.getElementById('users').value = process.users.join(', ');
      document.getElementById('status').value = process.status;
      var diagramXML = process.diagramXML;
      modeler.importXML(diagramXML);
    } else {
      alert('Processo não encontrado');
    }
  } else {
    urlForFetch = '/api/processes';
    method = 'POST';
    // Set default values for new process
    document.getElementById('status').value = "Novo"; // Setting default status as "Novo"
  }
});


document.getElementById('editForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const bpmnXML = await main();
  const data = {
    name: document.getElementById('name').value,
    version: document.getElementById('version').value,
    objective: document.getElementById('objective').value,
    owner: document.getElementById('owner').value,
    users: document.getElementById('users').value.split(',').map(user => user.trim()),
    status: document.getElementById('status').value,
    diagramXML: bpmnXML
  };

  const response = await fetch(urlForFetch, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    alert('Processo atualizado com sucesso');
    window.location.href = 'processes.html';
  } else {
    alert('Falha ao atualizar o processo');
  }
});

async function main() {
  try {
    const xml = await getDiagramXMLFromModeler(modeler);
    return xml;
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

async function getDiagramXMLFromModeler(modeler) {
  if (!modeler) {
    throw new Error("Modeler is not initialized.");
  }

  try {
    const { xml } = await modeler.saveXML({ format: true });
    return xml; // This will be the XML as a string
  } catch (error) {
    console.error("Failed to get XML data:", error);
    throw error; // Rethrow or handle error as needed
  }
}

var selectedElement = null;

// Attach event listener for element click
modeler.on('element.click', function(event) {
  selectedElement = event.element;
});

document.getElementById('setColorButton').addEventListener('click', function() {
  if (selectedElement) {
    var modeling = modeler.get('modeling');
    var color = document.getElementById('colorPicker').value;
    modeling.setColor([selectedElement], {
      fill: color,
      stroke: 'black'
    });
  } else {
    alert('Please select an element in the diagram first.');
  }
});

document.getElementById('addAnnotationButton').addEventListener('click', function() {
  if (selectedElement) {
    var modeling = modeler.get('modeling');
    var elementFactory = modeler.get('elementFactory');
    var annotation = elementFactory.createShape({ type: 'bpmn:TextAnnotation' });
    var text = prompt("Enter annotation text:", "");
    if (text) {
      annotation.businessObject.text = text;
      modeling.createShape(annotation, { x: selectedElement.x + 50, y: selectedElement.y + 50 }, selectedElement.parent);
    }
  } else {
    alert('Please select an element first.');
  }
});

var modelerFullscreen = new BpmnJS({
  container: '#diagramFullscreen',
  keyboard: {
    bindTo: window
  }
});

function toggleFullscreen() {
  var fullscreenElement = document.getElementById('fullscreenModeler');
  if (fullscreenElement.style.display === 'none') {
    fullscreenElement.style.display = 'block';
    modeler.saveXML({ format: true }, function(err, xml) {
      if (!err) {
        modelerFullscreen.importXML(xml);
      }
    });
  } else {
    fullscreenElement.style.display = 'none';
  }
}

document.getElementById('fullscreenToggle').addEventListener('click', toggleFullscreen);
document.getElementById('closeFullscreen').addEventListener('click', toggleFullscreen);

// Load initial diagram
$.get('https://cdn.statically.io/gh/bpmn-io/bpmn-js-examples/main/colors/resources/pizza-collaboration.bpmn', function(diagramXML) {
  modeler.importXML(diagramXML);
}, 'text');
