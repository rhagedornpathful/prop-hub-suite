import React from 'react';
import { ResponsiveMedia, ResponsiveImageGallery, ResponsiveHeroImage } from './ResponsiveMedia';
import { LazyImage } from './LazyImage';
import { PropertyImage } from './PropertyImage';

export function MobileMediaShowcase() {
  // Sample images from the available Unsplash collection
  const sampleImages = [
    {
      src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800',
      alt: 'Woman using laptop on bed',
      caption: 'Remote work setup'
    },
    {
      src: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800',
      alt: 'Gray laptop computer',
      caption: 'Modern workspace'
    },
    {
      src: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      alt: 'Circuit board macro photography',
      caption: 'Technology close-up'
    },
    {
      src: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      alt: 'Java programming on monitor',
      caption: 'Development environment'
    }
  ];

  return (
    <div className="container-responsive py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-responsive-xl font-bold mb-4">
            Mobile-Optimized Media Showcase
          </h1>
          <p className="text-responsive-lg text-muted-foreground">
            Demonstrating responsive images, lazy loading, and mobile optimizations
          </p>
        </div>

        {/* Hero Image Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Hero Image with Overlay</h2>
          <ResponsiveHeroImage
            src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200"
            alt="Person using MacBook Pro"
            className="h-96 rounded-lg"
            overlay={true}
          >
            <h3 className="text-4xl font-bold mb-4">Welcome to Our Platform</h3>
            <p className="text-xl mb-6">Experience the future of digital solutions</p>
            <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started
            </button>
          </ResponsiveHeroImage>
        </section>

        {/* Responsive Media Grid */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Responsive Image Gallery</h2>
          <ResponsiveImageGallery images={sampleImages} className="mb-8" />
        </section>

        {/* Different Aspect Ratios */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Different Aspect Ratios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Square (1:1)</h3>
              <ResponsiveMedia
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400"
                alt="Square aspect ratio"
                aspectRatio="square"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Photo (4:3)</h3>
              <ResponsiveMedia
                src="https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400"
                alt="Photo aspect ratio"
                aspectRatio="photo"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Video (16:9)</h3>
              <ResponsiveMedia
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400"
                alt="Video aspect ratio"
                aspectRatio="video"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">Portrait (3:4)</h3>
              <ResponsiveMedia
                src="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400"
                alt="Portrait aspect ratio"
                aspectRatio="portrait"
              />
            </div>
          </div>
        </section>

        {/* Property Images */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Property Images with Fallbacks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PropertyImage
              imageUrl="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400"
              address="123 Tech Street, Digital City"
            />
            <PropertyImage
              imageUrl="" // Empty URL to show fallback
              address="456 No Image Lane, Placeholder City"
            />
            <PropertyImage
              imageUrl="https://invalid-url.example.com/image.jpg" // Invalid URL to show error state
              address="789 Error Avenue, Fallback Town"
            />
          </div>
        </section>

        {/* Lazy Loading Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Lazy Loading Below the Fold</h2>
          <p className="text-muted-foreground mb-6">
            These images load only when they come into view (scroll down to see them load)
          </p>
          <div className="space-y-8">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="h-96">
                <LazyImage
                  src={`https://images.unsplash.com/photo-${[
                    '1649972904349-6e44c42644a7',
                    '1488590528505-98d2b5aba04b',
                    '1518770660439-4636190af475',
                    '1461749280684-dccba630e2f6',
                    '1486312338219-ce68d2c6f44d'
                  ][i]}?w=800&h=400`}
                  alt={`Lazy loaded image ${i + 1}`}
                  className="w-full h-full rounded-lg"
                />
                <p className="mt-2 text-center text-muted-foreground">
                  Lazy Image {i + 1} - Loads when in viewport
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Video Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Responsive Video</h2>
          <div className="bg-muted/20 p-6 rounded-lg">
            <p className="text-muted-foreground mb-4">
              Video placeholder - would contain actual video elements in a real implementation
            </p>
            <div className="video-container bg-black rounded-lg flex items-center justify-center">
              <div className="text-white text-center">
                <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <p>Responsive Video Container</p>
                <p className="text-sm opacity-75">16:9 aspect ratio maintained</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features List */}
        <section className="bg-muted/30 p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-6">Mobile Image Optimization Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3">Responsive Design</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ max-width: 100% on all images</li>
                <li>✓ height: auto maintains aspect ratios</li>
                <li>✓ object-fit: cover prevents distortion</li>
                <li>✓ Responsive grid layouts</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">Performance</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Lazy loading with Intersection Observer</li>
                <li>✓ loading="lazy" attribute for browser optimization</li>
                <li>✓ Progressive image loading</li>
                <li>✓ Optimized file sizes and formats</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3">User Experience</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>✓ Loading states and shimmer effects</li>
                <li>✓ Error handling with fallbacks</li>
                <li>✓ Touch-friendly fullscreen view</li>
                <li>✓ Proper alt text for accessibility</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}