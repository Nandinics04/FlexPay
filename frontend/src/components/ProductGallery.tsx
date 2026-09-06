import { useEffect, useState } from 'react';
import type { ProductMedia } from '../types';
import { galleryItems, youtubeEmbed } from '../utils/media';
import { ProductImage } from './ProductImage';

export function ProductGallery({
  coverImage,
  media = [],
  alt,
  color,
}: {
  coverImage: string;
  media?: ProductMedia[];
  alt: string;
  color?: string;
}) {
  const items = galleryItems(coverImage, media);
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState<number | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [coverImage, media]);

  useEffect(() => {
    if (index > items.length - 1) {
      setIndex(0);
    }
  }, [index, items.length]);

  const current = items[index] ?? items[0];
  const canSwipe = items.length > 1;

  const go = (next: number) => {
    setIndex((currentIndex) => {
      const count = items.length;
      return (currentIndex + next + count) % count;
    });
  };

  return (
    <div>
      <div
        className="relative flex min-h-[280px] items-center justify-center overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:min-h-[360px]"
        onPointerDown={(event) => {
          if (canSwipe) {
            setDragX(event.clientX);
          }
        }}
        onPointerUp={(event) => {
          if (dragX === null) {
            return;
          }
          const delta = event.clientX - dragX;
          setDragX(null);
          if (delta > 40) {
            go(-1);
          } else if (delta < -40) {
            go(1);
          }
        }}
        onPointerLeave={() => setDragX(null)}
      >
        {current?.type === 'video' ? (
          <VideoSlide url={current.url} title={alt} />
        ) : (
          <ProductImage
            key={current?.url}
            src={current?.url ?? ''}
            alt={alt}
            className="max-h-[380px] w-full object-contain"
          />
        )}
        {color ? (
          <span className="absolute bottom-4 right-4 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
            {color}
          </span>
        ) : null}
        {canSwipe ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-slate-700 shadow-sm"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-lg text-slate-700 shadow-sm"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
      {canSwipe ? (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {items.map((item, itemIndex) => (
            <button
              key={`${item.type}-${item.url}`}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white ${
                itemIndex === index
                  ? 'border-teal-600 ring-2 ring-teal-100'
                  : 'border-slate-200'
              }`}
            >
              {item.type === 'video' ? (
                <span className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-500">
                  Video
                </span>
              ) : (
                <ProductImage
                  src={item.url}
                  alt=""
                  className="h-full w-full object-contain p-1"
                />
              )}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function VideoSlide({ url, title }: { url: string; title: string }) {
  const youtube = youtubeEmbed(url);
  if (youtube) {
    return (
      <iframe
        src={youtube}
        title={title}
        className="aspect-video h-auto w-full max-h-[380px] rounded-xl"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <video
      src={url}
      controls
      className="max-h-[380px] w-full rounded-xl object-contain"
    >
      <track kind="captions" />
    </video>
  );
}
