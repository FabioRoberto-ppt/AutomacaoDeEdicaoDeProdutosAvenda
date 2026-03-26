'use client';

import Image from 'next/image';

export default function Hero() {
    return (
        <header className="hero" id="home">
            <div className="hero-content">
                {/* Substituído <img> por <Image />.
                    Ajuste width e height de acordo com o tamanho desejado da logo no Hero.
                */}
                <Image
                    src="/logoStile.svg"
                    alt="STILE Studio Hero Logo"
                    className="hero-logo"
                    width={300}
                    height={100}
                    priority // Essencial aqui, pois é a imagem principal do topo da página
                />
                <p>
                    A revolução na automação de conteúdos streetwear. Remova fundos e gere posts profissionais em segundos.
                </p>
                <a href="#ferramenta" className="btn-hero">COMEÇAR AGORA</a>
            </div>
        </header>
    );
}