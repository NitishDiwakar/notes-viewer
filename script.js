const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");

// Always fetch fresh list
fetch("list.php?t=" + Date.now())
  .then(r => r.json())
  .then(files => {
    const tree = buildTree(files);
    renderTree(tree, sidebar);
  });

function buildTree(files) {
  const root = {};

  files.forEach(path => {
    const parts = path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = (index === parts.length - 1) ? null : {};
      }
      current = current[part];
    });
  });

  return root;
}

function renderTree(node, container, path = "") {

  const keys = Object.keys(node).sort();
  const folders = keys.filter(k => node[k] !== null);
  const files = keys.filter(k => node[k] === null);


  [...folders, ...files].forEach(key => {

    const fullPath = path ? path + "/" + key : key;

    if (node[key] === null) {
      // FILE
      const file = document.createElement("div");
      file.className = "file";
      file.textContent = key;

      file.onclick = () => {
        document.querySelectorAll(".file").forEach(f => f.classList.remove("active"));
        file.classList.add("active");
        loadFile(fullPath);
      };

      container.appendChild(file);

    } else {
      // FOLDER
      const folder = document.createElement("div");
      folder.className = "folder";

      const title = document.createElement("div");
      title.className = "folder-title";

      const children = document.createElement("div");
      children.className = "folder-children";

      // Auto-open assets and assets/s
      const shouldOpen =
        (fullPath === "assets" || fullPath === "assets/s");

      children.style.display = shouldOpen ? "block" : "none";

      // ADD FOLDER ICONS HERE
      // title.textContent =
       // (shouldOpen ? "▼ 📂 " : "▶ 📁 ") + key;
   
//    title.innerHTML =
//  (shouldOpen
  //  ? '▼ <span class="folder-icon">📂</span> '
  //  : '▶ <span class="folder-icon">📁</span> ')
 // + key;

title.innerHTML =
  (shouldOpen
    ? '<span class="arrow">▼</span> <span class="folder-icon">📂</span> '
    : '<span class="arrow">▶</span> <span class="folder-icon">📁</span> ')
  + key;


      title.onclick = () => {
        const isOpen = children.style.display === "block";
        children.style.display = isOpen ? "none" : "block";

//        title.textContent =
//        (isOpen ? "▶ 📁 " : "▼ 📂 ") + key;

// title.innerHTML =
//   (isOpen
 //   ? '▶ <span class="folder-icon">📁</span> '
 //   : '▼ <span class="folder-icon">📂</span> ')
//  + key;	

title.innerHTML =
  (isOpen
    ? '<span class="arrow">▶</span> <span class="folder-icon">📁</span> '
    : '<span class="arrow">▼</span> <span class="folder-icon">📂</span> ')
  + key;

      };

      folder.appendChild(title);
      folder.appendChild(children);
      container.appendChild(folder);

      renderTree(node[key], children, fullPath);
    }
  });
}

function processImages(text, currentFilePath) {

  const dir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/') + 1);

  const imgDir = dir.replace("assets/s/", "assets/s/img/");

  return text.replace(/IMG:(\S+)/g, (match, filename) => {

    const cleanName = filename.trim();
    const fullImgPath = imgDir + cleanName;

    return `<a href="${fullImgPath}" class="img-link" target="_blank">📷 ${cleanName}</a>`;
  });
}

//
function processTags(text) {

  // Convert TAG:xxx into anchor target
  text = text.replace(/^TAG:(\S+)/gm, function(match, name) {
    return `<div id="${name}" class="anchor-target"></div>`;
  });

  // Convert GOTO:xxx into clickable link
  text = text.replace(/^GOTO:(\S+)/gm, function(match, name) {
  // return `<a href="#${name}" class="anchor-link">→ ${name}</a>`;
    return `<a href="#${name}" class="anchor-link">${name}</a>`;
  });

  return text;
}
// processPDF
function processPDF(text, currentFilePath) {

  const dir = currentFilePath.substring(0, currentFilePath.lastIndexOf('/') + 1);

  const pdfDir = dir.replace("assets/s/", "assets/s/pdf/");

  return text.replace(/PDF:(\S+)/g, (match, filename) => {

    const cleanName = filename.trim();
    const fullPdfPath = pdfDir + cleanName;

    return `<a href="${fullPdfPath}" class="pdf-link" target="_blank">📄 ${cleanName}</a>`;
  });
}
//

// processLinks
function processLinks(text) {

  return text.replace(/LINK:(\S+)/g, function(match, url) {

    const cleanUrl = url.trim();

    return `<a href="${cleanUrl}" class="ext-link" target="_blank">${cleanUrl}</a>`;

  });

}

function loadFile(file) {

  fetch(file)
    .then(r => r.text())
    .then(text => {

      text = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      text = text.replace(/\*(.*?)\*/g, "<strong>$1</strong>");

      text = processImages(text, file);

      text = processPDF(text, file);

      text = processLinks(text);

      text = processTags(text);

      content.innerHTML = text;
    });
}

const toggleBtn = document.getElementById("toggleBtn");
if (toggleBtn) {
  toggleBtn.onclick = () => {
    sidebar.classList.toggle("open");
  };
}
