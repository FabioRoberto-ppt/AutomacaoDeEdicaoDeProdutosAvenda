const SERVIDOR_URL = window.location.hostname === "localhost" ? "http://localhost:8080" : "SUA_URL_DO_RENDER";
let fotosArray = [];

// SALVA O QUE ESTÁ DIGITADO ANTES DE RE-RENDERIZAR
function sincronizarInputsNoArray() {
    fotosArray.forEach((item, index) => {
        const inputDe = document.getElementById(`de_${index}`);
        const inputPor = document.getElementById(`por_${index}`);
        const inputNum = document.getElementById(`num_${index}`);
        const inputMarca = document.getElementById(`marca_${index}`);
        const inputCod = document.getElementById(`cod_${index}`);

        if (inputDe) item.precoDe = inputDe.value;
        if (inputPor) item.precoPor = inputPor.value;
        if (inputNum) item.numero = inputNum.value;
        if (inputMarca) item.marca = inputMarca.value;
        if (inputCod) item.codigo = inputCod.value;
    });
}

document.getElementById('input-fotos').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    sincronizarInputsNoArray();

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
            // Extrai código do nome do arquivo (ex: camisapreta.jpg -> CAMISAPRETA)
            const nomeLimpo = file.name.toUpperCase().replace(/\.(JPG|PNG|JPEG|WEBP)$/i, "");

            fotosArray.push({
                arquivo: file,
                preview: event.target.result,
                precoDe: "",
                precoPor: "",
                numero: fotosArray.length + 1,
                marca: "STILE_",
                codigo: nomeLimpo
            });
            renderizarFotos();
        };
        reader.readAsDataURL(file);
    });
    this.value = "";
});

function renderizarFotos() {
    const grid = document.getElementById('grid-fotos');
    grid.innerHTML = '';

    fotosArray.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'item-foto';
        div.innerHTML = `
            <button class="btn-delete" onclick="removerFoto(${index})">✕</button>
            <div class="img-container">
                <img src="${item.preview}">
            </div>
            <div class="card-inputs">
                <input type="text" id="cod_${index}" class="input-codigo" placeholder="CÓDIGO" value="${item.codigo}">
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="de_${index}" placeholder="DE" value="${item.precoDe}">
                    <input type="text" id="por_${index}" placeholder="POR" value="${item.precoPor}">
                </div>
                <div style="display: flex; gap: 8px;">
                    <input type="number" id="num_${index}" value="${item.numero}">
                    <input type="text" id="marca_${index}" value="${item.marca}">
                </div>
                <button class="btn-download-single" onclick="gerarSolo(${index})">GERAR PNG</button>
            </div>
        `;
        grid.appendChild(div);
    });
    document.getElementById('btnGerar').style.display = fotosArray.length > 0 ? 'block' : 'none';
}

function removerFoto(index) {
    sincronizarInputsNoArray();
    fotosArray.splice(index, 1);
    fotosArray.forEach((item, i) => item.numero = i + 1); // Re-numerar
    renderizarFotos();
}

async function gerarSolo(index) {
    sincronizarInputsNoArray();
    const btn = event.target;
    btn.innerText = "PROCESSANDO...";

    const item = fotosArray[index];
    const formData = new FormData();
    formData.append('foto', item.arquivo);
    formData.append('api_key', document.getElementById('api_key').value);
    formData.append('preco_de', item.precoDe || "00");
    formData.append('preco_por', item.precoPor || "00");
    formData.append('numero', item.numero);
    formData.append('marca', item.marca);
    formData.append('codigo', item.codigo);

    try {
        const res = await fetch(`${SERVIDOR_URL}/gerar-imagem`, { method: 'POST', body: formData });
        if (res.ok) {
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${item.codigo}.png`;
            a.click();
        }
    } finally { btn.innerText = "GERAR PNG"; }
}

async function enviarTudo() {
    sincronizarInputsNoArray();
    const btn = document.getElementById('btnGerar');
    btn.innerText = "GERANDO ZIP...";

    const formData = new FormData();
    formData.append('api_key', document.getElementById('api_key').value);

    fotosArray.forEach(item => {
        formData.append('fotos', item.arquivo);
        formData.append('precos_de', item.precoDe || "00");
        formData.append('precos_por', item.precoPor || "00");
        formData.append('numeros', item.numero);
        formData.append('marcas', item.marca);
        formData.append('codigos', item.codigo);
    });

    try {
        const res = await fetch(`${SERVIDOR_URL}/gerar-arte`, { method: 'POST', body: formData });
        if (res.ok) {
            const blob = await res.blob();
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = "COLECAO_STILE.zip";
            a.click();
        }
    } finally { btn.innerText = "PROCESSAR COLEÇÃO E BAIXAR ZIP"; }
}