// config.js

export const CONFIG_MODOS = {
    PRODUTO: {
        label: 'STORY PRODUTO',
        emoji: '🛍️',
        // O endereço da API no seu Java para este modo
        endpoint: 'http://localhost:8080/gerar-imagem-produto',
        // A lista de inputs que vão aparecer no card
        campos: [
            { id: 'codigo', label: 'CÓDIGO', placeholder: 'Ex: ABC-123' },
            { id: 'numero', label: 'Nº', placeholder: '01' },
            { id: 'precoDe', label: 'PREÇO DE (R$)', placeholder: '99,90' },
            { id: 'precoPor', label: 'PREÇO POR (R$)', placeholder: '79,90' },
            { id: 'variacao', label: 'VARIAÇÃO', placeholder: 'CORES DISPONÍVEIS' }
        ]
    },
    CAPA: {
        label: 'STORY CAPA',
        emoji: '🎨',
        endpoint: 'http://localhost:8080/gerar-imagem-capa',
        campos: [
            { id: 'titulo', label: 'TÍTULO PRINCIPAL', placeholder: 'NOVA COLEÇÃO' },
            { id: 'subtitulo', label: 'SUBTÍTULO', placeholder: 'VERÃO 2024' }
        ]
    },
    FECHAMENTO: {
        label: 'STORY FECHAMENTO',
        emoji: '🎬',
        endpoint: 'http://localhost:8080/gerar-imagem-fim',
        campos: [
            { id: 'mensagem', label: 'MENSAGEM FINAL', placeholder: 'OBRIGADO PELA VISITA' },
            { id: 'botao', label: 'TEXTO DO BOTÃO', placeholder: 'CLIQUE AQUI' }
        ]
    },
    BIO: {
        label: 'CHAMADA BIO',
        emoji: '📱',
        endpoint: 'http://localhost:8080/gerar-imagem-bio',
        campos: [
            { id: 'link', label: 'LINK DA BIO', placeholder: 'linktr.ee/sualoja' },
            { id: 'chamada', label: 'CHAMADA', placeholder: 'CONFIRA NO PERFIL' }
        ]
    }
};