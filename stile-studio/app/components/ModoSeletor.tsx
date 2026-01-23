'use client';

interface ModoSeletorProps {
    modo: string;
    setModo: (modo: string) => void;
}

export default function ModoSeletor({ modo, setModo }: ModoSeletorProps) {
    const modos = ['PRODUTO', 'CAPA', 'FECHAMENTO', 'BIO'];

    return (
        <div className="modo-seletor flex justify-center gap-2 mb-10">
            {modos.map((m) => (
                <button
                    key={m}
                    onClick={() => setModo(m)}
                    className={`btn-modo ${modo === m ? 'active' : ''}`}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        backgroundColor: modo === m ? '#9182d5' : '#1a1a1a',
                        color: 'white'
                    }}
                >
                    {m === 'BIO' ? 'CHAMADA BIO' : `STORY ${m}`}
                </button>
            ))}
        </div>
    );
}