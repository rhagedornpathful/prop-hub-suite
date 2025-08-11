import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
}

export function SEOHead({
  title = 'PropHub Suite - Complete Property Management Platform',
  description = 'Streamline your property management with PropHub Suite. Manage properties, tenants, maintenance, and more in one comprehensive platform.',
  keywords = 'property management, real estate, tenant management, maintenance tracking, property portal',
  image = '/og-image.jpg',
  url,
  type = 'website',
  noIndex = false,
}: SEOHeadProps) {
  const siteTitle = 'PropHub Suite';
  const fullTitle = title.includes(siteTitle) ? title : `${title} | ${siteTitle}`;
  const currentUrl = url || window.location.href;

  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Canonical */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Additional SEO meta */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="en-US" />
      <meta name="author" content="PropHub Suite" />
      
      {/* Structured data for organization */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": siteTitle,
          "description": description,
          "url": currentUrl,
          "logo": image,
          "sameAs": []
        })}
      </script>
    </Helmet>
  );
}

// Page-specific SEO components
export function PropertySEO({ property }: { property: any }) {
  return (
    <SEOHead
      title={`${property.address} - Property Details`}
      description={`View details for ${property.address}. ${property.description || 'Professional property management services.'}`}
      keywords={`property, real estate, ${property.city}, ${property.state}, property management`}
      type="article"
    />
  );
}

export function MaintenanceSEO() {
  return (
    <SEOHead
      title="Maintenance Management"
      description="Efficiently manage maintenance requests, track work orders, and coordinate with vendors through our comprehensive maintenance platform."
      keywords="maintenance management, work orders, property maintenance, vendor coordination"
    />
  );
}

export function TenantPortalSEO() {
  return (
    <SEOHead
      title="Tenant Portal"
      description="Access your tenant portal to submit maintenance requests, view lease information, make payments, and communicate with property management."
      keywords="tenant portal, rent payment, maintenance requests, lease management"
    />
  );
}