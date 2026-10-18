interface Props {
  src?: string | null
  alt: string
  className?: string
  aspect?: 'square' | 'portrait' | 'landscape'
}

const ASPECT_CLASS = {
  square: 'aspect-square',
  landscape: 'aspect-[4/3]',
  portrait: 'aspect-[5/6]',
}

/**
 * Product image. If `src` is provided, it is shown. If not, we render a
 * simple beige block — clean and honest. No decorative graphics.
 */
export default function PlaceholderImage({ src, alt, className = '', aspect = 'portrait' }: Props) {
  const aspectClass = ASPECT_CLASS[aspect]

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={`${aspectClass} w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`${aspectClass} w-full bg-[var(--color-beige)] ${className}`}
    />
  )
}
