"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
const FALLBACK_IMAGE = "/watch-fallback.webp";
export default function HeroCarousel({ slides = [] }) {
  const validSlides = Array.isArray(slides)
    ? slides.filter(
        (slide) =>
          slide && typeof slide.imageUrl === "string" && slide.imageUrl.trim()
      )
    : [];
  const finalSlides =
    validSlides.length > 0
      ? validSlides
      : [
          {
            _id: "fallback",
            imageUrl: FALLBACK_IMAGE,
            title: "Luxury Watch Collection",
            redirectUrl: "/",
          },
        ];
  const [activeIndex, setActiveIndex] = useState(0);
  const slideCount = finalSlides.length;
  useEffect(() => {
    if (slideCount < 2) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slideCount);
    }, 5500);
    return () => clearInterval(timer);
  }, [slideCount]);
  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-neutral-800/80 bg-neutral-950 shadow-2xl shadow-black">
      {" "}
      <div className="relative w-full">
        {" "}
        {finalSlides.map((slide, index) => {
          const rawUrl = slide.redirectUrl || slide.linkUrl || "";
          const href = rawUrl
            ? rawUrl.startsWith("/") || rawUrl.startsWith("http")
              ? rawUrl
              : `/${rawUrl}`
            : "";
          const imageUrl = slide.imageUrl?.trim() || FALLBACK_IMAGE;
          const isActive = index === activeIndex;
          const content = (
            <div className="relative aspect-16/10 w-full overflow-hidden bg-neutral-950">
              {" "}
              <Image
                src={imageUrl}
                alt={slide.title || "Luxury watch collection"}
                fill
                priority={index === 0}
                fetchPriority={index === 0 ? "high" : "auto"}
                quality={75}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 58vw, 800px"
                className="object-cover object-center"
              />{" "}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-neutral-950 via-neutral-950/20 to-transparent" />{" "}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-neutral-950/50 via-transparent to-neutral-950/40" />{" "}
            </div>
          );
          return (
            <div
              key={slide._id || slide.id || index}
              className={`${
                index === 0 ? "relative" : "absolute inset-0"
              } w-full transition-opacity duration-700 ease-out ${
                isActive
                  ? "z-10 opacity-100"
                  : "pointer-events-none z-0 opacity-0"
              }`}
              aria-hidden={!isActive}
            >
              {" "}
              {href && href !== "/" ? (
                <Link
                  href={href}
                  className="block w-full"
                  tabIndex={isActive ? 0 : -1}
                >
                  {" "}
                  {content}{" "}
                </Link>
              ) : (
                <div className="block w-full">{content}</div>
              )}{" "}
            </div>
          );
        })}{" "}
      </div>{" "}
      {slideCount > 1 && (
        <div className="absolute bottom-5 left-0 right-0 z-30 flex items-center justify-center gap-2.5">
          {" "}
          {finalSlides.map((_, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={index}
                type="button"
                aria-label={`Go to slide ${index + 1}`}
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-10 bg-neutral-400"
                    : "w-2.5 bg-white/30 hover:bg-white/50"
                }`}
              />
            );
          })}{" "}
        </div>
      )}{" "}
    </section>
  );
}
