'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app  = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// ── Helpers de validação ──────────────────────────────────────────────────────
const validateEmail = (email: string): string | null => {
  // Deve conter @ e terminar com .com (pode ser .com.br, .com.xx, etc.)
  const emailRegex = /^[^\s@]+@[^\s@]+\.com(\.[a-z]{2,})?$/i;
  if (!email) return 'O e-mail é obrigatório.';
  if (!email.includes('@')) return 'O e-mail deve conter "@".';
  if (!emailRegex.test(email)) return 'O e-mail deve conter "@" e terminar com ".com".';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'A senha é obrigatória.';
  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'A senha deve conter pelo menos uma letra maiúscula.';
  if (!/[0-9]/.test(password)) return 'A senha deve conter pelo menos um número.';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password))
    return 'A senha deve conter pelo menos um caractere especial (!@#$%...).';
  return null;
};

// Mede força da senha: 0-4
const getPasswordStrength = (password: string): number => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) score++;
  return score;
};

const strengthLabel = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];
const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];

// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({ name: false, email: false, password: false, confirm: false });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Erros inline por campo
  const emailError   = touched.email    ? validateEmail(form.email)       : null;
  const passwordError = touched.password ? validatePassword(form.password) : null;
  const confirmError  = touched.confirm
    ? form.confirm !== form.password ? 'As senhas não coincidem.' : null
    : null;
  const nameError = touched.name && !form.name.trim() ? 'O nome de usuário é obrigatório.' : null;

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

const handleGmail = async () => {
  setLoading(true);
  setStatus({ type: 'info', message: 'Abrindo janela do Google...' });
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    setStatus({ type: 'success', message: `Bem-vindo(a), ${user.displayName ?? user.email}! 🎉` });
  } catch (err: any) {
    setStatus({ type: 'error', message: firebaseErrorMsg(err.code) });
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Marca todos como tocados para exibir todos os erros
    setTouched({ name: true, email: true, password: true, confirm: true });

    const nameErr     = !form.name.trim() ? 'O nome de usuário é obrigatório.' : null;
    const emailErr    = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);
    const confirmErr  = form.confirm !== form.password ? 'As senhas não coincidem.' : null;

    if (nameErr || emailErr || passwordErr || confirmErr) {
      setStatus({ type: 'error', message: 'Corrija os campos destacados antes de continuar.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Criando sua conta...' });
    // Substitua pelo seu fetch real
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setStatus({ type: 'success', message: 'Conta criada com sucesso! Bem-vindo(a) 🎉' });
  };

  return (
    <>
      <style>{`
        :root {
          --bg-black: #050505;
          --bg-card: #0f0f0f;
          --roxo-primary: #9182d5;
          --roxo-glow: rgba(145, 130, 213, 0.4);
          --roxo-dark: #6b5db3;
          --text-white: #ffffff;
          --text-gray: #a0a0a0;
          --border-color: #222222;
          --border-light: #333333;
        }

        .reg-page {
          min-height: 100dvh;
          background-color: var(--bg-black);
          color: var(--text-white);
          font-family: 'Inter', sans-serif;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow-x: hidden;
        }

        /* ── Blobs spray paint ── */
        .reg-spray1 {
          position: fixed;
          top: 8%; right: 4%;
          width: 320px; height: 320px;
          background: radial-gradient(circle at center,
            rgba(145,130,213,.22) 0%,
            rgba(145,130,213,.13) 22%,
            rgba(145,130,213,.06) 45%,
            transparent 75%);
          filter: blur(18px);
          border-radius: 50%;
          pointer-events: none;
          animation: regSpray1 8s ease-in-out infinite;
          z-index: 0;
        }

        .reg-spray2 {
          position: fixed;
          bottom: 12%; left: 6%;
          width: 260px; height: 260px;
          background: radial-gradient(ellipse at center,
            rgba(107,93,179,.28) 0%,
            rgba(107,93,179,.16) 28%,
            rgba(107,93,179,.07) 50%,
            transparent 80%);
          filter: blur(22px);
          border-radius: 60% 40% 30% 70%;
          pointer-events: none;
          animation: regSpray2 10s ease-in-out infinite;
          z-index: 0;
        }

        .reg-spray3 {
          position: fixed;
          top: 50%; left: 50%;
          width: 500px; height: 500px;
          transform: translate(-50%, -50%);
          background: radial-gradient(circle at center,
            rgba(26,18,61,.6) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
        }

        @keyframes regSpray1 {
          0%,100% { transform: translateY(0) scale(1); opacity: .7; }
          50%      { transform: translateY(18px) scale(1.1); opacity: .9; }
        }
        @keyframes regSpray2 {
          0%,100% { transform: rotate(0deg) scale(1); opacity: .6; }
          50%      { transform: rotate(5deg) scale(1.15); opacity: .85; }
        }

        /* ── Navbar ── */
        .reg-navbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 5%;
          height: 90px;
          background: rgba(5,5,5,.95);
          backdrop-filter: blur(15px);
          border-bottom: 1px solid var(--border-color);
          position: fixed;
          width: 100%;
          top: 0;
          z-index: 1000;
        }

        .reg-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: opacity .3s ease;
        }
        .reg-logo:hover { opacity: 0.85; }
        .reg-logo img {
          height: 180px !important;
          width: auto !important;
          object-fit: contain;
        }

        .reg-nav-link {
          text-decoration: none;
          color: var(--text-white);
          font-weight: 600;
          font-size: .9rem;
          transition: all .3s ease;
          position: relative;
        }
        .reg-nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 2px;
          background: var(--roxo-primary);
          transition: width .3s ease;
        }
        .reg-nav-link:hover { color: var(--roxo-primary); }
        .reg-nav-link:hover::after { width: 100%; }

        /* ── Main ── */
        .reg-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 110px 20px 60px;
          position: relative;
          z-index: 1;
        }

        /* ── Card ── */
        .reg-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 48px 44px;
          width: 100%;
          max-width: 480px;
          position: relative;
          animation: regFadeUp .5s ease-out both;
          box-shadow:
            0 0 0 1px rgba(145,130,213,.08),
            0 25px 60px rgba(0,0,0,.6),
            inset 0 1px 0 rgba(255,255,255,.04);
        }
        .reg-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          background: linear-gradient(135deg, rgba(145,130,213,.18), transparent 60%);
          pointer-events: none;
          z-index: -1;
        }

        @keyframes regFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Cabeçalho ── */
        .reg-card-header { text-align: center; margin-bottom: 32px; }

        .reg-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -1px;
          line-height: 1.1;
          margin: 0 0 8px;
        }
        .reg-highlight { color: var(--roxo-primary); }
        .reg-subtitle { color: var(--text-gray); font-size: .95rem; margin: 0; }

        /* ── Botão Google ── */
        .reg-btn-google {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 13px 20px;
          background: #fff;
          color: #111;
          border: none;
          border-radius: 10px;
          font-size: .95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all .3s ease;
          font-family: 'Inter', sans-serif;
          letter-spacing: .3px;
        }
        .reg-btn-google:hover {
          background: #f0eeff;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(145,130,213,.3);
        }
        .reg-btn-google:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        /* ── Divisor ── */
        .reg-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0;
        }
        .reg-divider-line { flex: 1; height: 1px; background: var(--border-color); }
        .reg-divider-text {
          color: var(--text-gray);
          font-size: .8rem;
          font-weight: 600;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: .8px;
        }

        /* ── Form ── */
        .reg-form { display: flex; flex-direction: column; gap: 16px; }
        .reg-field { display: flex; flex-direction: column; gap: 6px; }

        .reg-label {
          font-size: .8rem;
          font-weight: 700;
          color: var(--text-gray);
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .reg-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .reg-input {
          width: 100%;
          background: #000;
          border: 1px solid var(--border-color);
          color: var(--text-white);
          padding: 12px 44px 12px 15px;
          border-radius: 8px;
          font-family: 'Inter', sans-serif;
          font-size: .9rem;
          font-weight: 500;
          transition: all .3s ease;
          outline: none;
        }
        .reg-input::placeholder { color: var(--text-gray); opacity: .55; }
        .reg-input:focus {
          border-color: var(--roxo-primary);
          box-shadow: 0 0 0 3px var(--roxo-glow);
          background: #050505;
        }
        .reg-input:disabled { opacity: .5; cursor: not-allowed; }

        /* Estados de validação */
        .reg-input.is-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,.2);
        }
        .reg-input.is-valid {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,.15);
        }

        /* Mensagem de erro inline */
        .reg-field-error {
          font-size: .78rem;
          color: #ef4444;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          animation: regFadeUp .2s ease-out both;
        }
        .reg-field-error::before { content: '⚠'; font-size: .75rem; }

        /* ── Barra de força da senha ── */
        .reg-strength-wrap {
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .reg-strength-bars {
          display: flex;
          gap: 5px;
        }
        .reg-strength-bar {
          flex: 1;
          height: 3px;
          border-radius: 99px;
          background: var(--border-color);
          transition: background .3s ease;
        }
        .reg-strength-text {
          font-size: .75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .5px;
          transition: color .3s ease;
        }

        /* Dicas de senha */
        .reg-pwd-hints {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-top: 6px;
        }
        .reg-hint {
          font-size: .72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 20px;
          border: 1px solid var(--border-color);
          color: var(--text-gray);
          transition: all .3s ease;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .reg-hint.ok {
          color: #22c55e;
          border-color: rgba(34,197,94,.4);
          background: rgba(34,197,94,.07);
        }

        .reg-eye-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-gray);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          transition: color .3s ease;
          line-height: 0;
        }
        .reg-eye-btn:hover { color: var(--roxo-primary); }

        /* ── Status global ── */
        .reg-status {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: .88rem;
          font-weight: 600;
          text-align: center;
          animation: regFadeUp .3s ease-out both;
        }
        .reg-success {
          background: rgba(34,197,94,.1);
          border: 1px solid rgba(34,197,94,.3);
          color: #22c55e;
        }
        .reg-error {
          background: rgba(239,68,68,.1);
          border: 1px solid rgba(239,68,68,.3);
          color: #ef4444;
        }
        .reg-info {
          background: var(--roxo-glow);
          border: 1px solid var(--roxo-primary);
          color: var(--roxo-primary);
        }

        /* ── Botão submit ── */
        .reg-btn-submit {
          width: 100%;
          padding: 15px;
          background: var(--roxo-primary);
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 800;
          cursor: pointer;
          transition: all .4s ease;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 4px;
          box-shadow: 0 10px 30px rgba(145,130,213,.2);
          font-family: 'Inter', sans-serif;
        }
        .reg-btn-submit:hover:not(:disabled) {
          background: var(--roxo-dark);
          transform: translateY(-3px);
          box-shadow: 0 15px 40px var(--roxo-glow);
        }
        .reg-btn-submit:disabled {
          opacity: .6;
          cursor: not-allowed;
          animation: regPulse 1.5s ease-in-out infinite;
        }

        @keyframes regPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }

        /* ── Footer do card ── */
        .reg-footer-text {
          text-align: center;
          margin-top: 24px;
          color: var(--text-gray);
          font-size: .88rem;
        }
        .reg-footer-link {
          color: var(--roxo-primary);
          font-weight: 700;
          text-decoration: none;
          transition: color .3s ease;
        }
        .reg-footer-link:hover { color: #fff; text-decoration: underline; }

        /* ── Responsivo ── */
        @media (max-width: 520px) {
          .reg-card { padding: 36px 24px; border-radius: 16px; }
          .reg-title { font-size: 1.8rem; }
          .reg-navbar { height: 70px; }
          .reg-main { padding-top: 90px; }
        }
      `}</style>

      <div className="reg-page">
        <div className="reg-spray1" />
        <div className="reg-spray2" />
        <div className="reg-spray3" />

        {/* Navbar */}
        <nav className="reg-navbar">
          <Link href="/" className="reg-logo">
            <Image
              src="/logoStile.svg"
              alt="STILE Studio Logo"
              width={150}
              height={40}
              priority
            />
          </Link>
          <Link href="/login" className="reg-nav-link">Já tenho conta</Link>
        </nav>

        {/* Main */}
        <main className="reg-main">
          <div className="reg-card">

            <div className="reg-card-header">
              <h1 className="reg-title">
                Criar <span className="reg-highlight">Conta</span>
              </h1>
              <p className="reg-subtitle">Junte-se agora e comece a usar a plataforma.</p>
            </div>

            {/* Google */}
            <button type="button" className="reg-btn-google" onClick={handleGmail} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.315 0-9.832-3.315-11.658-7.97l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              Registrar com Google
            </button>

            <div className="reg-divider">
              <span className="reg-divider-line" />
              <span className="reg-divider-text">ou com e-mail</span>
              <span className="reg-divider-line" />
            </div>

            <form onSubmit={handleSubmit} className="reg-form" noValidate>

              {/* Nome */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="name">Nome de usuário</label>
                <div className="reg-input-wrap">
                  <input
                    id="name" name="name" type="text" placeholder="seunome"
                    value={form.name} onChange={handleChange} onBlur={handleBlur}
                    className={`reg-input${nameError ? ' is-error' : touched.name && form.name.trim() ? ' is-valid' : ''}`}
                    autoComplete="username" disabled={loading}
                  />
                </div>
                {nameError && <span className="reg-field-error">{nameError}</span>}
              </div>

              {/* E-mail */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="email">E-mail</label>
                <div className="reg-input-wrap">
                  <input
                    id="email" name="email" type="email" placeholder="voce@email.com"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    className={`reg-input${emailError ? ' is-error' : touched.email && !validateEmail(form.email) ? ' is-valid' : ''}`}
                    autoComplete="email" disabled={loading}
                  />
                </div>
                {emailError && <span className="reg-field-error">{emailError}</span>}
              </div>

              {/* Senha */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="password">Senha</label>
                <div className="reg-input-wrap">
                  <input
                    id="password" name="password" type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 8 caracteres" value={form.password}
                    onChange={handleChange} onBlur={handleBlur}
                    className={`reg-input${passwordError ? ' is-error' : touched.password && !validatePassword(form.password) ? ' is-valid' : ''}`}
                    autoComplete="new-password" disabled={loading}
                  />
                  <button type="button" className="reg-eye-btn" onClick={() => setShowPassword(v => !v)} tabIndex={-1}>
                    {showPassword
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>

                {/* Barra de força + dicas */}
                {form.password.length > 0 && (
                  <>
                    <div className="reg-strength-wrap">
                      <div className="reg-strength-bars">
                        {[1,2,3,4].map(i => (
                          <div
                            key={i}
                            className="reg-strength-bar"
                            style={{ background: passwordStrength >= i ? strengthColor[passwordStrength] : undefined }}
                          />
                        ))}
                      </div>
                      <span className="reg-strength-text" style={{ color: strengthColor[passwordStrength] }}>
                        {strengthLabel[passwordStrength]}
                      </span>
                    </div>
                    <div className="reg-pwd-hints">
                      <span className={`reg-hint${form.password.length >= 8 ? ' ok' : ''}`}>
                        {form.password.length >= 8 ? '✓' : '○'} 8+ caracteres
                      </span>
                      <span className={`reg-hint${/[A-Z]/.test(form.password) ? ' ok' : ''}`}>
                        {/[A-Z]/.test(form.password) ? '✓' : '○'} Maiúscula
                      </span>
                      <span className={`reg-hint${/[0-9]/.test(form.password) ? ' ok' : ''}`}>
                        {/[0-9]/.test(form.password) ? '✓' : '○'} Número
                      </span>
                      <span className={`reg-hint${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(form.password) ? ' ok' : ''}`}>
                        {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(form.password) ? '✓' : '○'} Especial
                      </span>
                    </div>
                  </>
                )}

                {passwordError && touched.password && <span className="reg-field-error">{passwordError}</span>}
              </div>

              {/* Confirmar senha */}
              <div className="reg-field">
                <label className="reg-label" htmlFor="confirm">Confirmar senha</label>
                <div className="reg-input-wrap">
                  <input
                    id="confirm" name="confirm" type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a senha" value={form.confirm}
                    onChange={handleChange} onBlur={handleBlur}
                    className={`reg-input${confirmError ? ' is-error' : touched.confirm && form.confirm && !confirmError ? ' is-valid' : ''}`}
                    autoComplete="new-password" disabled={loading}
                  />
                  <button type="button" className="reg-eye-btn" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}>
                    {showConfirm
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {confirmError && <span className="reg-field-error">{confirmError}</span>}
              </div>

              {status && (
                <div className={`reg-status reg-${status.type}`}>{status.message}</div>
              )}

              <button type="submit" className="reg-btn-submit" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <p className="reg-footer-text">
              Já tem uma conta?{' '}
              <Link href="/login" className="reg-footer-link">Entrar</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}