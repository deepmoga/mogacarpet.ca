import React from 'react';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ContactClient from './ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us & Showroom Location | Moga Carpet & Flooring Brampton',
  description: 'Visit Moga Carpet & Flooring in Brampton ON or contact our sales team at (905) 848-2222. Direct mill prices on broadloom carpets, vinyl planks, and rugs.',
};

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main>
        <ContactClient />
      </main>
      <Footer />
    </>
  );
}
