'use client';

import { useState, useRef, useEffect } from 'react';

export default function ModelCarousel() {
    const [selectedModel, setSelectedModel] = useState(null);
    const [galleryIndex, setGalleryIndex] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const carouselRef = useRef(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Inicializar carrossel no meio para permitir scroll infinito desde o início
    useEffect(() => {
        if (carouselRef.current && !isInitialized) {
            const cardWidth = 350;
            const middlePosition = models.length * cardWidth;
            carouselRef.current.scrollLeft = middlePosition;
            setIsInitialized(true);
        }
    }, [isInitialized]);

    // Dados dos modelos
    const models = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        name: `Modelo ${i + 1}`,
        category: ['Fashion', 'Editorial', 'Commercial'][i % 3],
        thumbnail: `https://picsum.photos/seed/${i + 1}/400/500`,
        photos: Array.from({ length: 5 }, (_, j) => ({
            id: j + 1,
            url: `https://picsum.photos/seed/${i + 1}-${j + 1}/800/1000`
        }))
    }));

    const handleMouseDown = (e) => {
        setIsDragging(true);
        setStartX(e.pageX - carouselRef.current.offsetLeft);
        setScrollLeft(carouselRef.current.scrollLeft);
        carouselRef.current.style.scrollBehavior = 'auto'; // Remove smooth scroll ao arrastar
    };

    const handleTouchStart = (e) => {
        setIsDragging(true);
        setStartX(e.touches[0].pageX - carouselRef.current.offsetLeft);
        setScrollLeft(carouselRef.current.scrollLeft);
        carouselRef.current.style.scrollBehavior = 'auto'; // Remove smooth scroll ao arrastar
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX) * 3; // Aumentado de 2 para 3 para mais velocidade
        carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX) * 3; // Aumentado de 2 para 3 para mais velocidade
        carouselRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (carouselRef.current) {
            carouselRef.current.style.scrollBehavior = 'smooth'; // Restaura smooth scroll
        }
    };

    const openGallery = (model) => {
        if (!isDragging) {
            setSelectedModel(model);
            setGalleryIndex(0);
        }
    };

    const closeGallery = () => {
        setSelectedModel(null);
        setGalleryIndex(0);
    };

    const nextPhoto = () => {
        if (galleryIndex < selectedModel.photos.length - 1) {
            setGalleryIndex(galleryIndex + 1);
        }
    };

    const prevPhoto = () => {
        if (galleryIndex > 0) {
            setGalleryIndex(galleryIndex - 1);
        }
    };

    // Funções para navegar entre cards (com loop infinito real)
    const scrollToNext = () => {
        if (carouselRef.current) {
            const cardWidth = 350;
            const scrollPosition = carouselRef.current.scrollLeft;
            const maxScroll = carouselRef.current.scrollWidth - carouselRef.current.clientWidth;

            carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });

            // Se chegou perto do final, reposiciona no meio
            setTimeout(() => {
                if (carouselRef.current.scrollLeft >= maxScroll - cardWidth) {
                    const middlePosition = models.length * cardWidth;
                    carouselRef.current.scrollLeft = middlePosition;
                }
            }, 500);
        }
    };

    const scrollToPrev = () => {
        if (carouselRef.current) {
            const cardWidth = 350;
            const scrollPosition = carouselRef.current.scrollLeft;

            carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });

            // Se chegou perto do início, reposiciona no meio
            setTimeout(() => {
                if (carouselRef.current.scrollLeft <= cardWidth) {
                    const middlePosition = models.length * cardWidth;
                    carouselRef.current.scrollLeft = middlePosition;
                }
            }, 500);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#050505',
            padding: '60px 20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Efeito de fundo roxo */}
            <div style={{
                position: 'fixed',
                top: '10%',
                right: '5%',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(145, 130, 213, 0.2) 0%, transparent 70%)',
                filter: 'blur(60px)',
                pointerEvents: 'none',
                zIndex: 0
            }} />

            <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                {/* Título */}
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{
                        fontSize: '48px',
                        fontWeight: '900',
                        color: 'white',
                        textTransform: 'uppercase',
                        marginBottom: '10px',
                        letterSpacing: '-1px'
                    }}>
                        Galeria de <span style={{ color: '#9182d5' }}>Modelos</span>
                    </h1>
                    <p style={{ color: '#a0a0a0', fontSize: '16px' }}>
                        Arraste para navegar • Clique para ver as fotos
                    </p>
                </div>

                {/* Container do Carrossel com setas */}
                <div style={{ position: 'relative', overflow: 'visible' }}>
                    {/* Seta Esquerda */}
                    <button
                        onClick={scrollToPrev}
                        style={{
                            position: 'absolute',
                            left: '-60px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: '#0f0f0f',
                            border: '2px solid #9182d5',
                            color: '#9182d5',
                            cursor: 'pointer',
                            fontSize: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            zIndex: 10,
                            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#9182d5';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0f0f0f';
                            e.currentTarget.style.color = '#9182d5';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                    >
                        ‹
                    </button>

                    {/* Seta Direita */}
                    <button
                        onClick={scrollToNext}
                        style={{
                            position: 'absolute',
                            right: '-60px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            backgroundColor: '#0f0f0f',
                            border: '2px solid #9182d5',
                            color: '#9182d5',
                            cursor: 'pointer',
                            fontSize: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            zIndex: 10,
                            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.5)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#9182d5';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#0f0f0f';
                            e.currentTarget.style.color = '#9182d5';
                            e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                        }}
                    >
                        ›
                    </button>

                    {/* Carrossel */}
                    <div
                        ref={carouselRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                        style={{
                            display: 'flex',
                            gap: '30px',
                            overflowX: 'auto',
                            overflowY: 'visible', // Permite expandir verticalmente
                            padding: '30px 20px 80px 20px', // Aumentado padding inferior
                            cursor: isDragging ? 'grabbing' : 'grab',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch'
                        }}
                    >
                        {/* Duplicar cards para efeito de loop infinito */}
                        {[...models, ...models, ...models].map((model, index) => (
                            <div
                                key={`${model.id}-${index}`}
                                onClick={() => openGallery(model)}
                                style={{
                                    minWidth: '320px',
                                    backgroundColor: '#0f0f0f',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    border: '1px solid #222222',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    position: 'relative'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDragging) {
                                        e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                                        e.currentTarget.style.borderColor = '#9182d5';
                                        e.currentTarget.style.boxShadow = '0 25px 50px rgba(145, 130, 213, 0.4)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                    e.currentTarget.style.borderColor = '#222222';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                {/* Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    left: '15px',
                                    backgroundColor: '#9182d5',
                                    padding: '6px 15px',
                                    borderRadius: '20px',
                                    zIndex: 10
                                }}>
                  <span style={{
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                  }}>
                    {model.category}
                  </span>
                                </div>

                                {/* Imagem */}
                                <div style={{
                                    width: '100%',
                                    height: '400px',
                                    overflow: 'hidden',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={model.thumbnail}
                                        alt={model.name}
                                        draggable="false"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.1)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                        }}
                                    />
                                    <div style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        height: '50%',
                                        background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)'
                                    }} />
                                </div>

                                {/* Info */}
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{
                                        color: 'white',
                                        fontSize: '22px',
                                        fontWeight: '800',
                                        marginBottom: '8px',
                                        textTransform: 'uppercase'
                                    }}>
                                        {model.name}
                                    </h3>
                                    <p style={{
                                        color: '#a0a0a0',
                                        fontSize: '14px',
                                        marginBottom: '15px'
                                    }}>
                                        {model.photos.length} fotos disponíveis
                                    </p>

                                    <button style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: 'transparent',
                                        border: '2px solid #9182d5',
                                        color: '#9182d5',
                                        borderRadius: '10px',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        textTransform: 'uppercase',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        letterSpacing: '1px'
                                    }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#9182d5';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.color = '#9182d5';
                                            }}>
                                        Ver Galeria
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Indicador de navegação */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '20px',
                    marginTop: '50px'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        color: '#a0a0a0',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        <span style={{ color: '#9182d5' }}>←</span>
                        Arraste ou use as setas
                        <span style={{ color: '#9182d5' }}>→</span>
                    </div>
                </div>
            </div>

            {/* Modal da Galeria */}
            {selectedModel && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}
                     onClick={closeGallery}
                >
                    {/* Container do conteúdo */}
                    <div
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '1200px', width: '100%' }}
                    >
                        {/* Botão fechar */}
                        <button
                            onClick={closeGallery}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(145, 130, 213, 0.2)',
                                border: '2px solid #9182d5',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.3s ease',
                                zIndex: 1001
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#9182d5';
                                e.currentTarget.style.transform = 'rotate(90deg)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(145, 130, 213, 0.2)';
                                e.currentTarget.style.transform = 'rotate(0deg)';
                            }}
                        >
                            ✕
                        </button>

                        {/* Título */}
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h2 style={{
                                color: 'white',
                                fontSize: '36px',
                                fontWeight: '900',
                                textTransform: 'uppercase',
                                marginBottom: '10px'
                            }}>
                                {selectedModel.name}
                            </h2>
                            <span style={{
                                color: '#9182d5',
                                fontSize: '16px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                            }}>
                {selectedModel.category}
              </span>
                        </div>

                        {/* Foto principal */}
                        <div style={{
                            position: 'relative',
                            backgroundColor: '#0f0f0f',
                            borderRadius: '20px',
                            padding: '10px',
                            border: '2px solid #222222',
                            marginBottom: '30px'
                        }}>
                            <img
                                src={selectedModel.photos[galleryIndex].url}
                                alt={`Foto ${galleryIndex + 1}`}
                                style={{
                                    width: '100%',
                                    height: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: '15px',
                                    backgroundColor: '#000000'
                                }}
                            />

                            {/* Botões de navegação */}
                            {galleryIndex > 0 && (
                                <button
                                    onClick={prevPhoto}
                                    style={{
                                        position: 'absolute',
                                        left: '20px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: '#9182d5',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 5px 20px rgba(145, 130, 213, 0.5)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                    }}
                                >
                                    ‹
                                </button>
                            )}

                            {galleryIndex < selectedModel.photos.length - 1 && (
                                <button
                                    onClick={nextPhoto}
                                    style={{
                                        position: 'absolute',
                                        right: '20px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '50%',
                                        backgroundColor: '#9182d5',
                                        border: 'none',
                                        color: 'white',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: '0 5px 20px rgba(145, 130, 213, 0.5)',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                                    }}
                                >
                                    ›
                                </button>
                            )}

                            {/* Contador */}
                            <div style={{
                                position: 'absolute',
                                bottom: '20px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                border: '2px solid #9182d5',
                                borderRadius: '30px',
                                padding: '10px 25px'
                            }}>
                <span style={{
                    color: '#9182d5',
                    fontWeight: '800',
                    fontSize: '18px'
                }}>
                  {galleryIndex + 1}
                </span>
                                <span style={{ color: '#666', margin: '0 8px' }}>/</span>
                                <span style={{ color: 'white', fontWeight: '800', fontSize: '18px' }}>
                  {selectedModel.photos.length}
                </span>
                            </div>
                        </div>

                        {/* Miniaturas */}
                        <div style={{
                            display: 'flex',
                            gap: '15px',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                        }}>
                            {selectedModel.photos.map((photo, idx) => (
                                <button
                                    key={photo.id}
                                    onClick={() => setGalleryIndex(idx)}
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '10px',
                                        overflow: 'hidden',
                                        border: idx === galleryIndex ? '3px solid #9182d5' : '3px solid #222222',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: idx === galleryIndex ? '0 5px 20px rgba(145, 130, 213, 0.5)' : 'none',
                                        transform: idx === galleryIndex ? 'scale(1.1)' : 'scale(1)'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (idx !== galleryIndex) {
                                            e.currentTarget.style.borderColor = '#9182d5';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (idx !== galleryIndex) {
                                            e.currentTarget.style.borderColor = '#222222';
                                        }
                                    }}
                                >
                                    <img
                                        src={photo.url}
                                        alt={`Miniatura ${idx + 1}`}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            opacity: idx === galleryIndex ? 1 : 0.6
                                        }}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                div::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
}