'use client';

import { useState, useEffect } from 'react';

export default function PhotoGrid() {
    const [fotosArray, setFotosArray] = useState([]);
    const [modo, setModo] = useState('PRODUTO');
    const [loading, setLoading] = useState(false);

    // Valores padrão que são salvos no navegador
    const [padraoTopo, setPadraoTopo] = useState('PEÇA O LINK NOS COMENTÁRIOS');
    const [padraoInsta, setPadraoInsta] = useState('@STILE_');

    useEffect(() => {
        const t = localStorage.getItem('stile_topo');
        const i = localStorage.getItem('stile_insta');
        if (t) setPadraoTopo(t);
        if (i) setPadraoInsta(i);
    }, []);

    const modos = [
        { id: 'PRODUTO', label: 'STORY PRODUTO', emoji: '🛍️' },
        { id: 'CAPA', label: 'STORY CAPA', emoji: '🎨' },
        { id: 'FECHAMENTO', label: 'STORY FECHAMENTO', emoji: '🎬' },
        { id: 'BIO', label: 'CHAMADA BIO', emoji: '📱' }
    ];

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        files.forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const nomeLimpo = file.name.toUpperCase().replace(/\.(JPG|PNG|JPEG|WEBP)$/i, '');
                const proximoNumero = (fotosArray.length + index + 1).toString().padStart(2, '0');

                const novaFoto = {
                    arquivo: file,
                    preview: event.target?.result,
                    textoTopo: padraoTopo,
                    codigo: nomeLimpo,
                    numero: proximoNumero,
                    precoDe: '',
                    precoPor: '',
                    variacao: 'COM VARIAÇÃO DE CORES',
                    usuarioProd: padraoInsta,
                };
                setFotosArray(prev => [...prev, novaFoto]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const handleChangeFoto = (index, field, value) => {
        setFotosArray(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));

        if (field === 'textoTopo') {
            localStorage.setItem('stile_topo', value);
            setPadraoTopo(value);
        }
        if (field === 'usuarioProd') {
            localStorage.setItem('stile_insta', value);
            setPadraoInsta(value);
        }
    };

    const handleRemoveFoto = (index) => {
        setFotosArray(prev => prev.filter((_, i) => i !== index));
    };

    // BOTÃO INDIVIDUAL - Agora envia a API KEY para o Java
    const handleGenerateSingle = async (index) => {
        const item = fotosArray[index];
        const apiKey = (localStorage.getItem('remove_bg_key') || '').trim();

        setLoading(true);
        const formData = new FormData();
        formData.append('foto', item.arquivo);
        formData.append('texto_topo', item.textoTopo);
        formData.append('codigo', item.codigo);
        formData.append('numero', item.numero);
        formData.append('preco_de', item.precoDe);
        formData.append('preco_por', item.precoPor);
        formData.append('texto_variacao', item.variacao);
        formData.append('instagram', item.usuarioProd);
        formData.append('api_key', apiKey); // Chave enviada aqui

        try {
            const response = await fetch('http://localhost:8080/gerar-imagem', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error();
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `STORY_${item.codigo}.png`;
            link.click();
        } catch (error) {
            alert("Erro no servidor Java! Verifique se ele está rodando.");
        } finally {
            setLoading(false);
        }
    };

    // BOTÃO ZIP - Agora também envia a API KEY para o Java
    const handleGenerateAllZip = async () => {
        const apiKey = (localStorage.getItem('remove_bg_key') || '').trim();

        setLoading(true);
        const formData = new FormData();
        formData.append('api_key', apiKey); // Chave enviada uma vez para o lote

        fotosArray.forEach((item) => {
            formData.append('fotos', item.arquivo);
            formData.append('textos_topo', item.textoTopo);
            formData.append('codigos', item.codigo);
            formData.append('numeros', item.numero);
            formData.append('precos_de', item.precoDe);
            formData.append('precos_por', item.precoPor);
            formData.append('textos_variacao', item.variacao);
            formData.append('marcas', item.usuarioProd);
        });

        try {
            const response = await fetch('http://localhost:8080/gerar-arte', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) throw new Error();
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "pack_stile.zip";
            a.click();
        } catch (error) {
            alert("Erro ao gerar ZIP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="photo-grid-container">
            <div className="section-header">
                <h2>FERRAMENTA DE <span className="highlight">GERAÇÃO</span></h2>
                <p className="subtitle">Integrado com Servidor Java Javalin</p>
            </div>

            <div className="modo-seletor-wrapper">
                <div className="modo-seletor-buttons">
                    {modos.map((m) => (
                        <button key={m.id} onClick={() => setModo(m.id)} className={'btn-modo' + (modo === m.id ? ' active' : '')}>
                            <div className="btn-modo-shine"></div>
                            <span className="btn-modo-emoji">{m.emoji}</span>
                            <span className="btn-modo-text">{m.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="upload-area-container">
                <div className="upload-card-modern">
                    <div className="upload-glow upload-glow-1"></div>
                    <div className="upload-glow upload-glow-2"></div>
                    <div className="upload-shimmer"></div>
                    <input type="file" id="file-input-grid" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <label htmlFor="file-input-grid" className="upload-button-modern">
                        <span className="upload-button-text">Selecionar Imagens 📁</span>
                        <div className="upload-button-shine"></div>
                    </label>
                </div>
            </div>

            {fotosArray.length > 0 && (
                <>
                    <div className="grid-header">
                        <h3>FOTOS CARREGADAS ({fotosArray.length})</h3>
                        <button onClick={handleGenerateAllZip} className="btn-generate-zip">
                            📦 GERAR TUDO EM ZIP
                        </button>
                    </div>

                    <div className="grid-fotos">
                        {fotosArray.map((item, index) => (
                            <div key={index} className="item-foto">
                                <button className="btn-delete" onClick={() => handleRemoveFoto(index)}>✕</button>
                                <div className="card-content">
                                    <div className="img-container">
                                        <img src={item.preview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div className="card-inputs">
                                        <input type="text" className="input-field global-field" value={item.textoTopo} onChange={(e) => handleChangeFoto(index, 'textoTopo', e.target.value)} placeholder="TOPO" />
                                        <input type="text" className="input-field" value={item.codigo} onChange={(e) => handleChangeFoto(index, 'codigo', e.target.value)} placeholder="CÓDIGO" />
                                        <input type="text" className="input-field num-field" value={item.numero} onChange={(e) => handleChangeFoto(index, 'numero', e.target.value)} placeholder="Nº" />
                                        <div className="price-row">
                                            <input type="text" value={item.precoDe} onChange={(e) => handleChangeFoto(index, 'precoDe', e.target.value)} placeholder="DE (R$)" />
                                            <input type="text" value={item.precoPor} onChange={(e) => handleChangeFoto(index, 'precoPor', e.target.value)} placeholder="POR (R$)" />
                                        </div>
                                        <input type="text" className="input-field" value={item.variacao} onChange={(e) => handleChangeFoto(index, 'variacao', e.target.value)} placeholder="VARIAÇÃO" />

                                        <input type="text" className="input-field global-field" value={item.usuarioProd} onChange={(e) => handleChangeFoto(index, 'usuarioProd', e.target.value)} placeholder="@USUARIO" />

                                        <button disabled={loading} onClick={() => handleGenerateSingle(index)} className="btn-generate">
                                            <span className="btn-icon">⚡</span>
                                            {loading ? 'GERANDO...' : 'GERAR NO JAVA'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
            <style jsx>{`
    .photo-grid-container { width: 100%; max-width: 1400px; margin: 0 auto; padding: 2rem 1rem; min-height: 100vh; }
    .section-header { text-align: center; margin-bottom: 3rem; }
    .section-header h2 { font-size: 2.5rem; font-weight: 800; color: white; margin: 0 0 1rem 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .section-header .highlight { background: linear-gradient(135deg, #8b7fd5 0%, #6b5db3 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .section-header .subtitle { font-size: 1.1rem; color: #999; margin: 0; }
    .upload-area-container { max-width: 1000px; width: 100%; margin: 0 auto; padding: 0 1rem; display: flex; align-items: center; justify-content: center; }
    .upload-card-modern { border: 2px dashed #333; border-radius: 20px; padding: 4rem 2rem; text-align: center; background: transparent; position: relative; overflow: hidden; transition: all 0.5s ease; min-height: 300px; display: flex; align-items: center; justify-content: center; width: 100%; }
    .upload-card-modern:hover { border-color: #9182d5; box-shadow: 0 15px 40px rgba(0, 0, 0, 0.5); }
    .upload-glow { position: absolute; border-radius: 50%; filter: blur(60px); pointer-events: none; opacity: 0; transition: opacity 0.5s ease; }
    .upload-card-modern:hover .upload-glow { opacity: 1; }
    .upload-glow-1 { top: 0; left: 25%; width: 250px; height: 250px; background: rgba(145, 130, 213, 0.2); animation: float 6s ease-in-out infinite; }
    .upload-glow-2 { bottom: 0; right: 25%; width: 250px; height: 250px; background: rgba(107, 93, 179, 0.2); animation: float 6s ease-in-out infinite 1s; }
    .upload-shimmer { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(145, 130, 213, 0.1), transparent); pointer-events: none; opacity: 0; }
    .upload-card-modern:hover .upload-shimmer { opacity: 1; animation: shimmer 3s infinite; }
    .upload-button-modern { position: relative; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.75rem; background: #1a1a1a; border: 2px solid #2a2a2a; color: white; font-weight: 800; border-radius: 8px; cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem; overflow: hidden; transition: all 0.3s ease; z-index: 10; }
    .upload-button-modern:hover { background: linear-gradient(135deg, #8b7fd5 0%, #6b5db3 100%); border-color: #9182d5; transform: scale(1.02); box-shadow: 0 8px 25px rgba(145, 130, 213, 0.35), 0 0 0 3px rgba(145, 130, 213, 0.15); }
    .upload-button-modern:active { transform: scale(0.98); }
    .upload-button-shine { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent); transition: left 1s; }
    .upload-button-modern:hover .upload-button-shine { left: 100%; }
    .upload-button-text, .upload-button-icon { position: relative; z-index: 1; }
    .upload-button-icon { display: inline-block; font-size: 1.1rem; transition: transform 0.3s ease; }
    .upload-button-modern:hover .upload-button-icon { transform: translateX(5px); }
    @keyframes float { 0%, 100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-20px) scale(1.1); } }
    @keyframes shimmer { 0% { left: -100%; } 100% { left: 100%; } }
    .modo-seletor-wrapper { margin-bottom: 2rem; }
    .modo-seletor-buttons { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.75rem; }
    .btn-modo { position: relative; padding: 0.75rem 1.75rem; background: #1a1a1a; border: 2px solid #2a2a2a; color: white; font-weight: 700; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; overflow: hidden; display: flex; align-items: center; gap: 0.5rem; }
    .btn-modo:hover { transform: scale(1.02); border-color: #9182d5; box-shadow: 0 4px 15px rgba(145, 130, 213, 0.2); }
    .btn-modo.active { background: linear-gradient(135deg, #8b7fd5 0%, #6b5db3 100%); border-color: #9182d5; transform: scale(1.02); box-shadow: 0 8px 25px rgba(145, 130, 213, 0.35); }
    .btn-modo-shine { position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent); transition: left 0.5s; }
    .btn-modo:hover .btn-modo-shine, .btn-modo.active .btn-modo-shine { left: 100%; }
    .btn-modo-particle { position: absolute; width: 6px; height: 6px; background: rgba(255, 255, 255, 0.6); border-radius: 50%; animation: ping 2s ease-in-out infinite; }
    .particle-1 { top: 8px; right: 8px; }
    .particle-2 { bottom: 8px; left: 8px; width: 4px; height: 4px; animation-delay: 0.3s; }
    .btn-modo-emoji { font-size: 1.25rem; display: inline-block; transition: transform 0.3s ease; }
    .btn-modo:hover .btn-modo-emoji { transform: scale(1.2) rotate(10deg); }
    .btn-modo-emoji.emoji-active { animation: bounce 0.6s ease-in-out; }
    .btn-modo-text { position: relative; z-index: 1; }
    .grid-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid #2a2a2a; }
    .grid-header h3 { font-size: 1.5rem; font-weight: 800; color: white; margin: 0; text-transform: uppercase; letter-spacing: 0.05em; }
    .photo-count { background: linear-gradient(135deg, #8b7fd5 0%, #6b5db3 100%); color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: 700; font-size: 0.9rem; }
    .grid-fotos { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .item-foto { position: relative; background: #1a1a1a; border: 2px solid #2a2a2a; border-radius: 16px; overflow: hidden; transition: all 0.3s ease; }
    .item-foto:hover { border-color: #9182d5; transform: translateY(-4px); box-shadow: 0 12px 30px rgba(145, 130, 213, 0.25); }
    .btn-delete { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; background: rgba(255, 68, 68, 0.15); backdrop-filter: blur(10px); border: 2px solid rgba(255, 68, 68, 0.5); border-radius: 50%; color: #ff4444; font-size: 1.2rem; font-weight: bold; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
    .btn-delete:hover { background: rgba(255, 68, 68, 0.9); color: white; border-color: #ff4444; transform: rotate(90deg) scale(1.1); }
    .card-content { display: flex; flex-direction: column; }
    .img-container { width: 100%; height: 240px; overflow: hidden; background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%); position: relative; }
    .card-inputs { padding: 1.25rem; display: flex; flex-direction: column; gap: 0.65rem; }
    .modo-badge { display: inline-block; padding: 0.4rem 0.75rem; background: linear-gradient(135deg, #8b7fd5 0%, #6b5db3 100%); color: white; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 6px; align-self: flex-start; }
    .input-field, .price-row input { width: 100%; padding: 0.7rem; background: #0a0a0a; border: 2px solid #2a2a2a; border-radius: 8px; color: white; font-size: 0.85rem; font-weight: 500; transition: all 0.2s ease; }
    .input-field:focus, .price-row input:focus { outline: none; border-color: #9182d5; box-shadow: 0 0 0 3px rgba(145, 130, 213, 0.15); }
    .input-field::placeholder, .price-row input::placeholder { color: #666; font-weight: 500; }
    .price-row { display: flex; gap: 0.5rem; }
    .btn-generate { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #8b7fd5 0%, #6b5db3 100%); border: 2px solid #9182d5; border-radius: 8px; color: white; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-top: 0.25rem; }
    .btn-generate:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(145, 130, 213, 0.4); }
    .btn-generate:active { transform: translateY(0); }
    .btn-icon { font-size: 1.1rem; }

    /* Estilos Adicionais para os novos inputs */
    .num-field { width: 70px !important; color: #9182d5 !important; font-weight: 800; text-align: center; }
    .global-field { background: #111 !important; border-color: #333 !important; color: #888 !important; font-size: 0.75rem !important; }
    .btn-generate-zip { background: white; color: black; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 800; cursor: pointer; transition: 0.3s; }
    .btn-generate-zip:hover { background: #9182d5; color: white; }

    @keyframes ping { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.5); } }
    @keyframes bounce { 0%, 100% { transform: scale(1) rotate(0deg); } 25% { transform: scale(1.2) rotate(-15deg); } 75% { transform: scale(1.2) rotate(15deg); } }
    @media (max-width: 768px) {
        .grid-fotos { grid-template-columns: 1fr; gap: 1rem; }
        .grid-header h3 { font-size: 1.2rem; }
        .modo-seletor-buttons { gap: 0.5rem; }
        .btn-modo { padding: 0.65rem 1.25rem; font-size: 0.75rem; }
        .img-container { height: 200px; }
        .section-header h2 { font-size: 1.8rem; }
        .section-header .subtitle { font-size: 0.95rem; }
        .upload-card-modern { padding: 3rem 1.5rem; }
        .upload-button-modern { padding: 0.75rem 1.5rem; font-size: 0.8rem; }
    }
`}</style>
        </div>
    );
}