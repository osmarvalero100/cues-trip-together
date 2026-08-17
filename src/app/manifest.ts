import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TripTogether Colombia',
    short_name: 'TripTogether',
    description: 'Arma tus parches y viaja fácil por Colombia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/api/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/api/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
