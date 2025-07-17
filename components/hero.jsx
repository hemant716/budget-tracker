"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

export default function HeroSection() {

  const imageRef =useRef(null);

  useEffect(()=>{
    const imageElement=imageRef.current;
      if (!imageElement) return;
    const  handleScroll=()=>{
        const scrollPosition = window.scrollY;
        const scrollthreshold = 100; // Adjust this value as needed

        if (scrollPosition>scrollthreshold) {
            imageElement.classList.add("scrolled")
        }else{
            imageElement.classList.remove("scrolled")
        }
    }
    window.addEventListener("scroll",handleScroll)
    return ()=>window.removeEventListener("scroll",handleScroll)
  },[])
    return (
        <div className="pb-20 px-4">
            <div className='container mx-auto text-center'>
                <h1 className='text-5xl mt-36 md:text-8xl lg:text-[105px] pb-6 gradient-title'>
                    Manage your finances <br /> with intelligence
                </h1>
                <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
                    An AI-powered financial management platform that helps you track,
                    analyze, and optimize your spending with real-time insights.
                </p>
                <div className='flex justify-center  space-x-4'>
                    <Link href="/dashboard" >
                        <Button size="lg" className="px-20">Get Started</Button>
                    </Link>
                    
                </div>
                <div className='hero-image-wrapper '>
                    <div ref={imageRef} className='hero-image' >
                        <Image
                            src="/banner.jpeg"
                            width={1200}
                            height={720}
                            alt='Dashboard preview'
                            className="rounded-lg shadow-2xl border mx-auto"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
