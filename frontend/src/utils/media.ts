import type { ProductMedia } from '../types';

export function inferMediaType(url: string): 'image' | 'video' {
  if (
    /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) ||
    /youtube\.com|youtu\.be|vimeo\.com/i.test(url)
  ) {
    return 'video';
  }
  return 'image';
}

export function youtubeEmbed(url: string) {
  const watch = url.match(/[?&]v=([\w-]+)/);
  const short = url.match(/youtu\.be\/([\w-]+)/);
  const embed = url.match(/youtube\.com\/embed\/([\w-]+)/);
  const id = embed?.[1] ?? watch?.[1] ?? short?.[1];
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function galleryItems(
  coverImage: string,
  media: ProductMedia[] = [],
): ProductMedia[] {
  const extras = media
    .map((item): ProductMedia => ({
      type: item.type ?? inferMediaType(item.url),
      url: item.url.trim(),
    }))
    .filter((item) => item.url && item.url !== coverImage);

  const items: ProductMedia[] = [
    { type: 'image', url: coverImage },
    ...extras,
  ];
  return items.filter((item) => item.url);
}
