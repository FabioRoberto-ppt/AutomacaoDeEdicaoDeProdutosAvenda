'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const savedKey = localStorage.getItem('remove_bg_key');
        if (savedKey) {
            const input = document.getElementById('api_key');
            if (input) (input as HTMLInputElement).value = savedKey;
        }
    }, []);

    const handleLinkClick = () => setMenuOpen(false);

    return (
        <>
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

                {/* Só links de navegação aqui, sem Registrar */}
                <ul className={`nav-links ${menuOpen ? 'nav-links--open' : ''}`}>
                    <li><a href="#home" onClick={handleLinkClick}>Home</a></li>
                    <li><a href="#ferramenta" onClick={handleLinkClick}>Ferramenta</a></li>
                    <li><a href="#planos" onClick={handleLinkClick}>Planos</a></li>

                    {/* Mobile only */}
                    <li className="nav-links__api-mobile">
                        <input
                            type="text"
                            className="api-min-input"
                            placeholder="API KEY REMOVE.BG"
                            onChange={(e) => localStorage.setItem('remove_bg_key', e.target.value)}
                        />
                    </li>
                    <li className="nav-links__login-mobile">
                        <a href="#registrar" className="nav-link-register" onClick={handleLinkClick}>
                            Registrar-se
                        </a>
                    </li>
                </ul>

                {/* Desktop: Registrar + API Key — lado direito */}
                <div className="nav-auth nav-auth--desktop">
                    <a href="#registrar" className="nav-link-register">
                        Registrar-se
                    </a>
                    <input
                        type="text"
                        id="api_key"
                        className="api-min-input"
                        placeholder="API KEY REMOVE.BG"
                        onChange={(e) => localStorage.setItem('remove_bg_key', e.target.value)}
                    />
                </div>

                <button
                    className={`hamburger ${menuOpen ? 'hamburger--open' : ''}`}
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Abrir menu"
                    aria-expanded={menuOpen}
                >
                    <span />
                    <span />
                    <span />
                </button>
            </nav>

            {menuOpen && (
                <div className="nav-overlay" onClick={() => setMenuOpen(false)} />
            )}
        </>
    );
}