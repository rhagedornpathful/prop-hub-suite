import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { zillowUrl } = await req.json();

    if (!zillowUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Zillow URL is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Scraping Zillow URL:', zillowUrl);

    // Use Firecrawl to scrape the Zillow page
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: zillowUrl,
        formats: ['markdown', 'html'],
        includeTags: ['h1', 'h2', 'h3', 'p', 'span', 'div', 'meta'],
        excludeTags: ['script', 'style', 'nav', 'footer', 'header'],
        onlyMainContent: false
      }),
    });

    if (!firecrawlResponse.ok) {
      const errorText = await firecrawlResponse.text();
      console.error('Firecrawl API error:', errorText);
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status} ${errorText}`);
    }

    const scrapedData = await firecrawlResponse.json();
    console.log('Scraped data received from Firecrawl');

    // Extract property data
    const propertyData = extractPropertyData(scrapedData, zillowUrl);

    return new Response(
      JSON.stringify({ 
        success: true, 
        propertyData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in scrape-zillow-property function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

function extractPropertyData(scrapedData: any, zillowUrl: string): any {
  // Get both markdown content and HTML
  const content = scrapedData.data?.content || scrapedData.data?.markdown || '';
  const html = scrapedData.data?.html || '';
  
  console.log('Extracting property data from content...');
  
  // Initialize property data object
  const propertyData: any = {
    bedrooms: null,
    bathrooms: null,
    square_feet: null,
    price: null,
    address: null,
    city: null,
    state: null,
    zip_code: null,
    property_type: null,
    year_built: null,
    lot_size: null,
    estimated_value: null,
    home_value_estimate: null,
    rent_estimate: null,
    images: []
  };

  try {
    // Log the first 1000 characters to help debug
    console.log('Content sample (first 1000 chars):', content.substring(0, 1000));
    
    // Extract from URL first - most reliable for Zillow
    console.log('Extracting from URL:', zillowUrl);
    const urlMatch = zillowUrl.match(/\/homedetails\/(.+?)-([A-Z]{2})-(\d{5})\/(\d+)_zpid/);
    if (urlMatch) {
      console.log('URL match found:', urlMatch);
      const streetAddress = urlMatch[1].replace(/-/g, ' ');
      const state = urlMatch[2];
      const zipCode = urlMatch[3];
      
      propertyData.address = streetAddress;
      propertyData.state = state;
      propertyData.zip_code = zipCode;
      
      // Try to extract city from the street address or content
      // Often the city is at the end of the street address
      const addressParts = streetAddress.split(' ');
      if (addressParts.length > 3) {
        // Take the last 1-2 words as potential city
        const potentialCity = addressParts.slice(-2).join(' ');
        if (potentialCity.match(/^[A-Za-z\s]+$/)) {
          propertyData.city = potentialCity;
        }
      }
    }

    // More aggressive pattern matching using multiple strategies
    const allText = content + ' ' + html;
    
    // Extract bedrooms - look for any pattern with numbers and bed-related words
    const bedroomPatterns = [
      /(\d+)\s*(?:bed|bd|br|bedroom)s?/gi,
      /(?:bed|bedroom)s?[:\s]*(\d+)/gi,
      /(\d+)\s*(?:BR|bed)/gi
    ];
    
    for (const pattern of bedroomPatterns) {
      const matches = allText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const num = parseInt(match.match(/\d+/)?.[0] || '0');
          if (num >= 1 && num <= 20) {
            propertyData.bedrooms = num;
            break;
          }
        }
        if (propertyData.bedrooms) break;
      }
    }

    // Extract bathrooms
    const bathroomPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)s?/gi,
      /(?:bath|bathroom)s?[:\s]*(\d+(?:\.\d+)?)/gi,
      /(\d+(?:\.\d+)?)\s*(?:BA|bath)/gi
    ];
    
    for (const pattern of bathroomPatterns) {
      const matches = allText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const num = parseFloat(match.match(/[\d.]+/)?.[0] || '0');
          if (num >= 0.5 && num <= 20) {
            propertyData.bathrooms = num;
            break;
          }
        }
        if (propertyData.bathrooms) break;
      }
    }

    // Extract square footage
    const sqftPatterns = [
      /(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft|sqft|square\s*feet)/gi,
      /(\d{1,3}(?:,\d{3})*)\s*(?:SF|sq\.?\s*ft)/gi
    ];
    
    for (const pattern of sqftPatterns) {
      const matches = allText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const num = parseInt(match.match(/[\d,]+/)?.[0]?.replace(/,/g, '') || '0');
          if (num >= 100 && num <= 50000) {
            propertyData.square_feet = num;
            break;
          }
        }
        if (propertyData.square_feet) break;
      }
    }

    // Extract dollar amounts for property values and rent
    const dollarMatches = allText.match(/\$(\d{1,3}(?:,\d{3})*)/g);
    if (dollarMatches) {
      const amounts = dollarMatches
        .map(amt => parseInt(amt.replace(/[$,]/g, '')))
        .filter(amt => amt >= 1000)
        .sort((a, b) => b - a);
      
      if (amounts.length > 0) {
        // Property values are typically higher
        const propertyValues = amounts.filter(amt => amt >= 50000 && amt <= 50000000);
        if (propertyValues.length > 0) {
          propertyData.estimated_value = propertyValues[0];
          propertyData.home_value_estimate = propertyValues[0];
        }
        
        // Rental values are typically in the $500-$20000 range
        const rentValues = amounts.filter(amt => amt >= 500 && amt <= 20000);
        if (rentValues.length > 0) {
          // Look for context clues for rent
          const rentContext = /(?:rent|rental)[^$]*\$(\d{1,3}(?:,\d{3})*)/gi;
          const rentMatches = allText.match(rentContext);
          if (rentMatches) {
            const rentAmount = parseInt(rentMatches[0].match(/\$(\d{1,3}(?:,\d{3})*)/)?.[1]?.replace(/,/g, '') || '0');
            if (rentAmount >= 500 && rentAmount <= 20000) {
              propertyData.rent_estimate = rentAmount;
              propertyData.monthly_rent = rentAmount;
            }
          } else {
            // Fallback to smallest reasonable amount
            propertyData.rent_estimate = Math.min(...rentValues);
            propertyData.monthly_rent = Math.min(...rentValues);
          }
        }
      }
    }

    // Extract year built
    const yearMatches = allText.match(/\b(19\d{2}|20\d{2})\b/g);
    if (yearMatches) {
      const years = yearMatches
        .map(y => parseInt(y))
        .filter(y => y >= 1800 && y <= new Date().getFullYear())
        .sort((a, b) => a - b);
      
      if (years.length > 0) {
        // Look for context clues for "built" or "year"
        const builtContext = /(?:built|year built|construction|constructed)[^0-9]*(\d{4})/gi;
        const builtMatches = allText.match(builtContext);
        if (builtMatches) {
          const builtYear = parseInt(builtMatches[0].match(/\d{4}/)?.[0] || '0');
          if (builtYear >= 1800 && builtYear <= new Date().getFullYear()) {
            propertyData.year_built = builtYear;
          }
        } else {
          propertyData.year_built = years[0];
        }
      }
    }

    // Extract lot size
    const lotSizePatterns = [
      /(\d+(?:\.\d+)?)\s*(?:acre|acres)/gi,
      /lot\s*size[:\s]*(\d+(?:\.\d+)?)\s*(acre|sq\.?\s*ft|square\s*feet)/gi,
      /(\d+(?:,\d{3})*)\s*(?:sq\.?\s*ft|square\s*feet)\s*lot/gi
    ];
    
    for (const pattern of lotSizePatterns) {
      const matches = allText.match(pattern);
      if (matches) {
        for (const match of matches) {
          const sizeMatch = match.match(/(\d+(?:\.\d+)?)/);
          if (sizeMatch) {
            const size = parseFloat(sizeMatch[1]);
            if (match.toLowerCase().includes('acre') && size >= 0.1 && size <= 100) {
              propertyData.lot_size = `${size} acres`;
              break;
            } else if (match.toLowerCase().includes('ft') && size >= 1000 && size <= 1000000) {
              propertyData.lot_size = `${size.toLocaleString()} sq ft`;
              break;
            }
          }
        }
        if (propertyData.lot_size) break;
      }
    }

    // Extract city if not found from URL
    if (!propertyData.city) {
      const cityPatterns = [
        /([A-Za-z\s]+),\s*[A-Z]{2}\s*\d{5}/g,
        /"city":\s*"([^"]+)"/gi,
        /"addressLocality":\s*"([^"]+)"/gi
      ];
      
      for (const pattern of cityPatterns) {
        const matches = allText.match(pattern);
        if (matches) {
          for (const match of matches) {
            const cityMatch = match.match(/([A-Za-z\s]+),/) || match.match(/"([^"]+)"/);
            if (cityMatch && cityMatch[1]) {
              const city = cityMatch[1].trim();
              if (city.length > 2 && !city.match(/^\d/) && city.match(/^[A-Za-z\s]+$/)) {
                propertyData.city = city;
                break;
              }
            }
          }
          if (propertyData.city) break;
        }
      }
    }

    // Determine property type from keywords
    const contentLower = allText.toLowerCase();
    if (contentLower.includes('single family') || contentLower.includes('single-family') || contentLower.includes('detached')) {
      propertyData.property_type = 'single_family';
    } else if (contentLower.includes('townhouse') || contentLower.includes('townhome') || contentLower.includes('town house')) {
      propertyData.property_type = 'townhouse';
    } else if (contentLower.includes('condo') || contentLower.includes('condominium')) {
      propertyData.property_type = 'condo';
    } else if (contentLower.includes('apartment') || contentLower.includes('apt')) {
      propertyData.property_type = 'apartment';
    } else if (contentLower.includes('duplex') || contentLower.includes('multi-family') || contentLower.includes('multi family')) {
      propertyData.property_type = 'multi_family';
    }

    // Extract property images from HTML
    const imageUrls: string[] = [];
    if (html) {
      const imagePatterns = [
        /<img[^>]+src="([^"]*photos\.zillowstatic\.com[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi,
        /<img[^>]+data-src="([^"]*photos\.zillowstatic\.com[^"]*\.(?:jpg|jpeg|png|webp)[^"]*)"/gi
      ];
      
      for (const pattern of imagePatterns) {
        let match;
        while ((match = pattern.exec(html)) !== null) {
          const imageUrl = match[1];
          if (imageUrl && !imageUrl.includes('icon') && !imageUrl.includes('logo')) {
            const highQualityUrl = imageUrl.replace(/\/\d+_\d+_/, '/1024_768_');
            if (!imageUrls.includes(highQualityUrl)) {
              imageUrls.push(highQualityUrl);
            }
          }
        }
      }
      propertyData.images = imageUrls.slice(0, 5);
    }

    console.log('Extracted property data:', propertyData);
    
    // Log each field individually for debugging
    console.log('Individual field extraction results:');
    console.log('- Address:', propertyData.address);
    console.log('- City:', propertyData.city);
    console.log('- State:', propertyData.state);
    console.log('- ZIP:', propertyData.zip_code);
    console.log('- Bedrooms:', propertyData.bedrooms);
    console.log('- Bathrooms:', propertyData.bathrooms);
    console.log('- Square Feet:', propertyData.square_feet);
    console.log('- Property Type:', propertyData.property_type);
    console.log('- Estimated Value:', propertyData.estimated_value);
    console.log('- Home Value Estimate (Zestimate):', propertyData.home_value_estimate);
    console.log('- Rent Estimate (Rent Zestimate):', propertyData.rent_estimate);
    console.log('- Images found:', propertyData.images?.length || 0);
    
  } catch (error) {
    console.error('Error extracting property data:', error);
  }

  return propertyData;
}