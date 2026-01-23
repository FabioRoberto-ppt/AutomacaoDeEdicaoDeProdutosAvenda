'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function Navbar() {
    // Carrega a chave salva ao abrir a página
    useEffect(() => {
        const savedKey = localStorage.getItem('remove_bg_key');
        if (savedKey) {
            const input = document.getElementById('api_key');
            if (input) input.value = savedKey;
        }
    }, []);

    return (
        <nav className="navbar">
            <div className="logo">
                <Image
                    src="/logoStile.svg"
                    alt="STILE Studio Logo"
                    className="logo-img"
                    width={150}
                    height={40}
                    priority
                />
            </div>
            <ul className="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#ferramenta">Ferramenta</a></li>
                <li><a href="#planos">Planos</a></li>
            </ul>
            <div className="nav-auth">
                <input
                    type="text"
                    id="api_key"
                    className="api-min-input"
                    placeholder="API KEY REMOVE.BG"
                    // Salva a chave automaticamente enquanto o usuário digita
                    onChange={(e) => localStorage.setItem('remove_bg_key', e.target.value)}
                />
            </div>
        </nav>
    );
}