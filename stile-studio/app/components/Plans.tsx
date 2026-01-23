'use client';

export default function Plans() {
    return (
        <section className="plans-section" id="planos">
            <div className="section-header">
                <h2>NOSSOS <span>PLANOS</span></h2>
            </div>

            <div className="plans-grid">
                {/* Plano FREE */}
                <div className="plan-card">
                    <h3>FREE</h3>
                    <div className="price">R$ 0<span>/mês</span></div>
                    <ul>
                        <li>5 Artes Diárias</li>
                        <li>Qualidade Standard</li>
                        <li>Com Marca d&apos;água</li>
                    </ul>
                    <button type="button" className="btn-plan">SELECIONAR</button>
                </div>

                {/* Plano PREMIUM - Destaque */}
                <div className="plan-card featured">
                    <div className="badge">MAIS POPULAR</div>
                    <h3>PREMIUM</h3>
                    <div className="price">R$ 49<span>/mês</span></div>
                    <ul>
                        <li>Artes Ilimitadas</li>
                        <li>Qualidade Ultra HD</li>
                        <li>Sem Marca d&apos;água</li>
                        <li>Suporte Prioritário</li>
                    </ul>
                    <button type="button" className="btn-plan">ASSINAR AGORA</button>
                </div>

                {/* Plano PRO */}
                <div className="plan-card pro">
                    <div className="badge pro-badge">PRO</div>
                    <h3>PRO</h3>
                    <div className="price">R$ 99<span>/mês</span></div>
                    <ul>
                        <li>Tudo do Premium</li>
                        <li>API de Integração</li>
                        <li>Processamento em Lote</li>
                    </ul>
                    <button type="button" className="btn-plan">CONTRATAR PRO</button>
                </div>
            </div>

            <style jsx>{`
                .plans-section {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    padding: 100px 5%;
                    background: #050505;
                    text-align: center;
                    position: relative;
                    overflow: hidden;
                }

                /* Spray Paint nos Planos - Elemento 6 */
                .plans-section::before {
                    content: '';
                    position: absolute;
                    top: 10%;
                    left: 3%;
                    width: 350px;
                    height: 200px;
                    background: radial-gradient(
                        ellipse 90% 100% at 30% 50%,
                        rgba(107, 93, 179, 0.28) 0%,
                        rgba(107, 93, 179, 0.16) 30%,
                        rgba(107, 93, 179, 0.08) 55%,
                        transparent 80%
                    );
                    filter: blur(16px);
                    transform: rotate(-8deg);
                    z-index: 0;
                    pointer-events: none;
                    animation: plansSpray1 11s ease-in-out infinite;
                }

                @keyframes plansSpray1 {
                    0%, 100% {
                        transform: rotate(-8deg) scale(1);
                        opacity: 0.6;
                    }
                    50% {
                        transform: rotate(-5deg) scale(1.15);
                        opacity: 0.8;
                    }
                }

                /* Respingo nos Planos - Elemento 7 */
                .plans-section::after {
                    content: '';
                    position: absolute;
                    bottom: 20%;
                    right: 8%;
                    width: 280px;
                    height: 280px;
                    background: radial-gradient(
                        circle at 60% 40%,
                        rgba(145, 130, 213, 0.3) 0%,
                        rgba(145, 130, 213, 0.18) 25%,
                        rgba(145, 130, 213, 0.09) 50%,
                        rgba(145, 130, 213, 0.03) 70%,
                        transparent 90%
                    );
                    filter: blur(14px);
                    z-index: 0;
                    pointer-events: none;
                    border-radius: 45% 55% 60% 40%;
                    animation: plansSpray2 13s ease-in-out infinite;
                }

                @keyframes plansSpray2 {
                    0%, 100% {
                        transform: rotate(0deg) scale(1);
                        opacity: 0.5;
                    }
                    50% {
                        transform: rotate(8deg) scale(1.2);
                        opacity: 0.75;
                    }
                }

                .section-header {
                    margin-bottom: 50px;
                    position: relative;
                    z-index: 1;
                }

                .section-header h2 {
                    font-size: 2.5rem;
                    font-weight: 900;
                    font-family: 'Montserrat', sans-serif;
                    text-transform: uppercase;
                    letter-spacing: -1px;
                    color: #ffffff;
                }

                .section-header h2 span {
                    color: #9182d5;
                }

                .plans-grid {
                    display: flex;
                    justify-content: center;
                    gap: 30px;
                    flex-wrap: wrap;
                    align-items: center;
                    position: relative;
                    z-index: 1;
                }

                .plan-card {
                    background: #0f0f0f;
                    padding: 40px;
                    border-radius: 20px;
                    width: 300px;
                    border: 1px solid #222222;
                    transition: all 0.4s ease;
                    position: relative;
                    z-index: 1;
                }

                .plan-card:hover {
                    transform: translateY(-10px);
                    border-color: #333333;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
                }

                .plan-card.featured {
                    border: 2px solid #9182d5;
                    transform: scale(1.1);
                    position: relative;
                    box-shadow: 0 25px 60px rgba(145, 130, 213, 0.4);
                    z-index: 10;
                    padding: 50px 40px;
                }

                .plan-card.featured:hover {
                    transform: scale(1.12) translateY(-10px);
                }

                .plan-card.pro {
                    border: 2px solid #6b5db3;
                    background: linear-gradient(135deg, #0f0f0f 0%, #0a0a0f 100%);
                }

                .plan-card.pro:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 15px 40px rgba(107, 93, 179, 0.3);
                }

                .plan-card h3 {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #ffffff;
                }

                .badge {
                    position: absolute;
                    top: -15px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: #9182d5;
                    font-size: 0.7rem;
                    padding: 6px 18px;
                    border-radius: 20px;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    box-shadow: 0 5px 15px rgba(145, 130, 213, 0.4);
                    color: #ffffff;
                }

                .badge.pro-badge {
                    background: linear-gradient(90deg, #6b5db3, #9182d5);
                }

                .price {
                    font-size: 3rem;
                    font-weight: 900;
                    margin: 20px 0;
                    color: #9182d5;
                }

                .plan-card.pro .price {
                    background: linear-gradient(90deg, #6b5db3, #9182d5);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .price span {
                    font-size: 1rem;
                    color: #a0a0a0;
                }

                .plan-card ul {
                    list-style: none;
                    margin-bottom: 30px;
                    color: #a0a0a0;
                    text-align: left;
                    min-height: 180px;
                }

                .plan-card ul li {
                    padding: 8px 0;
                    border-bottom: 1px solid #222222;
                    font-size: 0.95rem;
                }

                .plan-card ul li:last-child {
                    border-bottom: none;
                }

                .btn-plan {
                    width: 100%;
                    padding: 14px;
                    background: transparent;
                    border: 2px solid #9182d5;
                    color: #9182d5;
                    font-weight: 700;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    font-size: 0.9rem;
                }

                .btn-plan:hover {
                    background: #9182d5;
                    color: white;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 25px rgba(145, 130, 213, 0.4);
                }

                @media (max-width: 768px) {
                    .plans-section {
                        padding: 80px 5%;
                    }

                    .plans-grid {
                        flex-direction: column;
                        align-items: center;
                        gap: 40px;
                    }

                    .plan-card,
                    .plan-card.featured,
                    .plan-card.pro {
                        width: 100%;
                        max-width: 350px;
                        transform: scale(1) !important;
                        z-index: 1 !important;
                    }

                    .plan-card.featured {
                        padding: 40px;
                        order: -1;
                    }

                    .plan-card:hover,
                    .plan-card.featured:hover,
                    .plan-card.pro:hover {
                        transform: translateY(-5px) !important;
                    }
                }
            `}</style>
        </section>
    );
}