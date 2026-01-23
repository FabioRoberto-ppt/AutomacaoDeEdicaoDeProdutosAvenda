'use client';

import Image from "next/image";

export default function Footer() {
    return (
        <footer className="footer">
            <Image
                src="/logoStile.svg"
                alt="STILE Studio Logo"
                className="logo-img"
                width={150}
                height={40}
                priority // Adicionado pois a logo geralmente é um item de alta prioridade (LCP)
            />
            <p>&copy; 2026 Todos os direitos reservados. Design focado em performance.</p>
        </footer>
    );
}