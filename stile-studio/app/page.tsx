'use client';

import { useState } from 'react';
import Navbar from '@/app/components/Navbar';
import Hero from '@/app/components/Hero';
import UploadCard from '@/app/components/PhotoGrid';
import Plans from '@/app/components/Plans';
import Footer from '@/app/components/Footer';
import ModelCarousel from '@/app/components/ModelCarousel';
import PhotoGrid from '@/app/components/PhotoGrid';

// 1. Definindo a interface para substituir o 'any'
interface FotoBase {
    arquivo: File;
    preview: string;
    codigo: string;
}

export default function Home() {
    const [modo, setModo] = useState('PRODUTO');

    // 2. Aplicando a interface no estado
    const [fotos, setFotos] = useState<FotoBase[]>([]);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles: FotoBase[] = Array.from(e.target.files).map(file => ({
            arquivo: file,
            preview: URL.createObjectURL(file),
            codigo: file.name.split('.')[0].toUpperCase(),
        }));

        setFotos((prev) => [...prev, ...newFiles]);
    };

    return (
        <>
            <Navbar />
            <Hero />

            <main className="container" id="ferramenta">

                <ModelCarousel />

                <PhotoGrid />

            </main>

            <Plans />
            <Footer />
        </>
    );
}