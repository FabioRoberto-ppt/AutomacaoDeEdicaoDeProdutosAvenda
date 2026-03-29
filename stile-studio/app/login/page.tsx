'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
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

// Mapeia códigos de erro do Firebase para mensagens amigáveis em PT-BR
const firebaseErrorMsg = (code: string): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido. Verifique o formato.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada. Entre em contato com o suporte.';
    case 'auth/user-not-found':
      return 'Nenhuma conta encontrada com este e-mail.';
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos. Verifique suas credenciais.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de conexão. Verifique sua internet.';
    case 'auth/popup-closed-by-user':
      return 'Login cancelado. A janela foi fechada.';
    case 'auth/popup-blocked':
      return 'Pop-up bloqueado pelo navegador. Permita pop-ups e tente novamente.';
    case 'auth/cancelled-popup-request':
      return 'Solicitação cancelada. Tente novamente.';
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
};

// ── Helpers de validação ──────────────────────────────────────────────────────
const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.com(\.[a-z]{2,})?$/i;
  if (!email) return 'O e-mail é obrigatório.';
  if (!email.includes('@')) return 'O e-mail deve conter "@".';
  if (!emailRegex.test(email)) return 'O e-mail deve conter "@" e terminar com ".com".';
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return 'A senha é obrigatória.';
  if (password.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [status, setStatus]   = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const emailError    = touched.email    ? validateEmail(form.email)       : null;
  const passwordError = touched.password ? validatePassword(form.password) : null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setStatus(null);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  // ── Login com Google ─────────────────────────────────────────────────────
  const handleGmail = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Abrindo janela do Google...' });
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setStatus({ type: 'success', message: `Bem-vindo(a) de volta, ${user.displayName ?? user.email}! 🎉` });
      // TODO: redirecionar após login bem-sucedido
    } catch (err: any) {
      setStatus({ type: 'error', message: firebaseErrorMsg(err.code) });
    } finally {
      setLoading(false);
    }
  };

  // ── Login com e-mail/senha ───────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({ email: true, password: true });

    const emailErr    = validateEmail(form.email);
    const passwordErr = validatePassword(form.password);

    if (emailErr || passwordErr) {
      setStatus({ type: 'error', message: 'Corrija os campos destacados antes de continuar.' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'info', message: 'Verificando suas credenciais...' });

    try {
      const result = await signInWithEmailAndPassword(auth, form.email, form.password);
      const user = result.user;
      setStatus({ type: 'success', message: `Bem-vindo(a) de volta, ${user.displayName ?? user.email}! 🎉` });
      // TODO: redirecionar após login bem-sucedido
    } catch (err: any) {
      setStatus({ type: 'error', message: firebaseErrorMsg(err.code) });
    } finally {
      setLoading(false);
    }
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

        .log-page {
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
        .log-spray1 {
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
          animation: logSpray1 8s ease-in-out infinite;
          z-index: 0;
        }

        .log-spray2 {
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
          animation: logSpray2 10s ease-in-out infinite;
          z-index: 0;
        }

        .log-spray3 {
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

        @keyframes logSpray1 {
          0%,100% { transform: translateY(0) scale(1); opacity: .7; }
          50%      { transform: translateY(18px) scale(1.1); opacity: .9; }
        }
        @keyframes logSpray2 {
          0%,100% { transform: rotate(0deg) scale(1); opacity: .6; }
          50%      { transform: rotate(5deg) scale(1.15); opacity: .85; }
        }

        /* ── Navbar ── */
        .log-navbar {
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

        .log-logo {
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: opacity .3s ease;
        }
        .log-logo:hover { opacity: 0.85; }
        .log-logo img {
          height: 180px !important;
          width: auto !important;
          object-fit: contain;
        }

        .log-nav-link {
          text-decoration: none;
          color: var(--text-white);
          font-weight: 600;
          font-size: .9rem;
          transition: all .3s ease;
          position: relative;
        }
        .log-nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px; left: 0;
          width: 0; height: 2px;
          background: var(--roxo-primary);
          transition: width .3s ease;
        }
        .log-nav-link:hover { color: var(--roxo-primary); }
        .log-nav-link:hover::after { width: 100%; }

        /* ── Main ── */
        .log-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 110px 20px 60px;
          position: relative;
          z-index: 1;
        }

        /* ── Card ── */
        .log-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 20px;
          padding: 48px 44px;
          width: 100%;
          max-width: 480px;
          position: relative;
          animation: logFadeUp .5s ease-out both;
          box-shadow:
            0 0 0 1px rgba(145,130,213,.08),
            0 25px 60px rgba(0,0,0,.6),
            inset 0 1px 0 rgba(255,255,255,.04);
        }
        .log-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 21px;
          background: linear-gradient(135deg, rgba(145,130,213,.18), transparent 60%);
          pointer-events: none;
          z-index: -1;
        }

        @keyframes logFadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Cabeçalho ── */
        .log-card-header { text-align: center; margin-bottom: 32px; }

        .log-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 2.2rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: -1px;
          line-height: 1.1;
          margin: 0 0 8px;
        }
        .log-highlight { color: var(--roxo-primary); }
        .log-subtitle { color: var(--text-gray); font-size: .95rem; margin: 0; }

        /* ── Botão Google ── */
        .log-btn-google {
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
        .log-btn-google:hover {
          background: #f0eeff;
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(145,130,213,.3);
        }
        .log-btn-google:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        /* ── Divisor ── */
        .log-divider {
          display: flex;
          align-items: center;
          gap: 14px;
          margin: 24px 0;
        }
        .log-divider-line { flex: 1; height: 1px; background: var(--border-color); }
        .log-divider-text {
          color: var(--text-gray);
          font-size: .8rem;
          font-weight: 600;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: .8px;
        }

        /* ── Form ── */
        .log-form { display: flex; flex-direction: column; gap: 16px; }
        .log-field { display: flex; flex-direction: column; gap: 6px; }

        .log-label {
          font-size: .8rem;
          font-weight: 700;
          color: var(--text-gray);
          text-transform: uppercase;
          letter-spacing: .7px;
        }

        .log-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .log-input {
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
        .log-input::placeholder { color: var(--text-gray); opacity: .55; }
        .log-input:focus {
          border-color: var(--roxo-primary);
          box-shadow: 0 0 0 3px var(--roxo-glow);
          background: #050505;
        }
        .log-input:disabled { opacity: .5; cursor: not-allowed; }

        /* Estados de validação */
        .log-input.is-error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,.2);
        }
        .log-input.is-valid {
          border-color: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,.15);
        }

        /* Mensagem de erro inline */
        .log-field-error {
          font-size: .78rem;
          color: #ef4444;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          animation: logFadeUp .2s ease-out both;
        }
        .log-field-error::before { content: '⚠'; font-size: .75rem; }

        .log-eye-btn {
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
        .log-eye-btn:hover { color: var(--roxo-primary); }

        /* ── Esqueci a senha ── */
        .log-forgot {
          text-align: right;
          margin-top: -6px;
        }
        .log-forgot-link {
          color: var(--text-gray);
          font-size: .8rem;
          font-weight: 600;
          text-decoration: none;
          transition: color .3s ease;
        }
        .log-forgot-link:hover { color: var(--roxo-primary); text-decoration: underline; }

        /* ── Status global ── */
        .log-status {
          padding: 12px 16px;
          border-radius: 8px;
          font-size: .88rem;
          font-weight: 600;
          text-align: center;
          animation: logFadeUp .3s ease-out both;
        }
        .log-success {
          background: rgba(34,197,94,.1);
          border: 1px solid rgba(34,197,94,.3);
          color: #22c55e;
        }
        .log-error {
          background: rgba(239,68,68,.1);
          border: 1px solid rgba(239,68,68,.3);
          color: #ef4444;
        }
        .log-info {
          background: var(--roxo-glow);
          border: 1px solid var(--roxo-primary);
          color: var(--roxo-primary);
        }

        /* ── Botão submit ── */
        .log-btn-submit {
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
        .log-btn-submit:hover:not(:disabled) {
          background: var(--roxo-dark);
          transform: translateY(-3px);
          box-shadow: 0 15px 40px var(--roxo-glow);
        }
        .log-btn-submit:disabled {
          opacity: .6;
          cursor: not-allowed;
          animation: logPulse 1.5s ease-in-out infinite;
        }

        @keyframes logPulse {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }

        /* ── Footer do card ── */
        .log-footer-text {
          text-align: center;
          margin-top: 24px;
          color: var(--text-gray);
          font-size: .88rem;
        }
        .log-footer-link {
          color: var(--roxo-primary);
          font-weight: 700;
          text-decoration: none;
          transition: color .3s ease;
        }
        .log-footer-link:hover { color: #fff; text-decoration: underline; }

        /* ── Responsivo ── */
        @media (max-width: 520px) {
          .log-card { padding: 36px 24px; border-radius: 16px; }
          .log-title { font-size: 1.8rem; }
          .log-navbar { height: 70px; }
          .log-main { padding-top: 90px; }
        }
      `}</style>

      <div className="log-page">
        <div className="log-spray1" />
        <div className="log-spray2" />
        <div className="log-spray3" />

        {/* Navbar */}
        <nav className="log-navbar">
          <Link href="/" className="log-logo">
            <Image
              src="/logoStile.svg"
              alt="STILE Studio Logo"
              width={150}
              height={40}
              priority
            />
          </Link>
          <Link href="/register" className="log-nav-link">Criar conta</Link>
        </nav>

        {/* Main */}
        <main className="log-main">
          <div className="log-card">

            <div className="log-card-header">
              <h1 className="log-title">
                Bem-vindo <span className="log-highlight">de volta</span>
              </h1>
              <p className="log-subtitle">Entre na sua conta para continuar.</p>
            </div>

            {/* Google */}
            <button type="button" className="log-btn-google" onClick={handleGmail} disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.332 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.001 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.315 0-9.832-3.315-11.658-7.97l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              Entrar com Google
            </button>

            <div className="log-divider">
              <span className="log-divider-line" />
              <span className="log-divider-text">ou com e-mail</span>
              <span className="log-divider-line" />
            </div>

            <form onSubmit={handleSubmit} className="log-form" noValidate>

              {/* E-mail */}
              <div className="log-field">
                <label className="log-label" htmlFor="email">E-mail</label>
                <div className="log-input-wrap">
                  <input
                    id="email" name="email" type="email" placeholder="voce@email.com"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    className={`log-input${emailError ? ' is-error' : touched.email && !validateEmail(form.email) ? ' is-valid' : ''}`}
                    autoComplete="email" disabled={loading}
                  />
                </div>
                {emailError && <span className="log-field-error">{emailError}</span>}
              </div>

              {/* Senha */}
              <div className="log-field">
                <label className="log-label" htmlFor="password">Senha</label>
                <div className="log-input-wrap">
                  <input
                    id="password" name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={form.password} onChange={handleChange} onBlur={handleBlur}
                    className={`log-input${passwordError ? ' is-error' : touched.password && !validatePassword(form.password) ? ' is-valid' : ''}`}
                    autoComplete="current-password" disabled={loading}
                  />
                  <button
                    type="button" className="log-eye-btn"
                    onClick={() => setShowPassword(v => !v)} tabIndex={-1}
                  >
                    {showPassword
                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
                {passwordError && <span className="log-field-error">{passwordError}</span>}
              </div>

              {/* Esqueci a senha */}
              <div className="log-forgot">
                <Link href="/forgot-password" className="log-forgot-link">
                  Esqueci minha senha
                </Link>
              </div>

              {status && (
                <div className={`log-status log-${status.type}`}>{status.message}</div>
              )}

              <button type="submit" className="log-btn-submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="log-footer-text">
              Não tem uma conta?{' '}
              <Link href="/register" className="log-footer-link">Criar conta</Link>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}