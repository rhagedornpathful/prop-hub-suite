import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { zillowUrl } = await req.json()

    if (!zillowUrl) {
      return new Response(
        JSON.stringify({ error: 'Zillow URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Scraping Zillow URL:', zillowUrl)

    // Use Firecrawl to scrape the Zillow page
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: zillowUrl,
        formats: ['markdown', 'html'],
        onlyMainContent: true,
        includeTags: ['.ds-bed-bath-living-area', '.ds-price', '.ds-address', '.ds-status-details', '.summary-container'],
        excludeTags: ['script', 'style', 'nav', 'footer', 'ads']
      }),
    })

    if (!firecrawlResponse.ok) {
      const error = await firecrawlResponse.text()
      console.error('Firecrawl API error:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to scrape Zillow page' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const scrapedData = await firecrawlResponse.json()
    console.log('Scraped data received from Firecrawl')

    // Extract property information from the scraped content
    const propertyData = extractPropertyData(scrapedData)

    return new Response(
      JSON.stringify({ success: true, propertyData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error scraping Zillow:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function extractPropertyData(scrapedData: any) {
  const content = scrapedData.data?.content || scrapedData.data?.markdown || ''
  const html = scrapedData.data?.html || ''
  
  console.log('Extracting property data from content...')
  
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
  }

  try {
    // Extract address
    const addressMatch = content.match(/(?:Address:|Street:)\s*([^\n\r,]+(?:,\s*[^\n\r,]+)*)/i) ||
                         html.match(/<h1[^>]*>([^<]*(?:St|Ave|Rd|Dr|Ln|Blvd|Way|Ct|Pl)[^<]*)<\/h1>/i)
    if (addressMatch) {
      propertyData.address = addressMatch[1].trim()
    }

    // Extract city, state, zip from various patterns
    // Look for patterns like "City, State ZIP" or "City, ST 12345"
    const locationMatch = content.match(/([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/i) ||
                         html.match(/([A-Za-z\s]+),\s*([A-Z]{2})\s*(\d{5}(?:-\d{4})?)/i)
    
    if (locationMatch) {
      propertyData.city = locationMatch[1].trim()
      propertyData.state = locationMatch[2].trim()
      propertyData.zip_code = locationMatch[3].trim()
    } else {
      // Try alternative patterns for city/state/zip
      const cityMatch = content.match(/(?:City|Location):\s*([A-Za-z\s]+)/i)
      if (cityMatch) {
        propertyData.city = cityMatch[1].trim()
      }
      
      const stateMatch = content.match(/(?:State|ST):\s*([A-Z]{2})/i)
      if (stateMatch) {
        propertyData.state = stateMatch[1].trim()
      }
      
      const zipMatch = content.match(/(?:ZIP|Zip Code):\s*(\d{5}(?:-\d{4})?)/i) ||
                      content.match(/\b(\d{5}(?:-\d{4})?)\b/)
      if (zipMatch) {
        propertyData.zip_code = zipMatch[1].trim()
      }
    }

    // Extract bedrooms
    const bedroomMatch = content.match(/(\d+)\s*(?:bd|bed|bedroom)/i) ||
                        html.match(/(\d+)\s*bed/i)
    if (bedroomMatch) {
      propertyData.bedrooms = parseInt(bedroomMatch[1])
    }

    // Extract bathrooms
    const bathroomMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:ba|bath|bathroom)/i) ||
                         html.match(/(\d+(?:\.\d+)?)\s*bath/i)
    if (bathroomMatch) {
      propertyData.bathrooms = parseFloat(bathroomMatch[1])
    }

    // Extract square feet
    const sqftMatch = content.match(/(\d{1,3}(?:,\d{3})*)\s*(?:sq\s*ft|sqft|square\s*feet)/i) ||
                     html.match(/(\d{1,3}(?:,\d{3})*)\s*sq\s*ft/i)
    if (sqftMatch) {
      propertyData.square_feet = parseInt(sqftMatch[1].replace(/,/g, ''))
    }

    // Extract Zestimate (Zillow's property value estimate)
    const zestimateMatch = content.match(/zestimate[:\s]*\$(\d{1,3}(?:,\d{3})*)/i) ||
                          html.match(/zestimate[^$]*\$(\d{1,3}(?:,\d{3})*)/i)
    if (zestimateMatch) {
      propertyData.home_value_estimate = parseInt(zestimateMatch[1].replace(/,/g, ''))
      // Also set estimated_value for backwards compatibility
      propertyData.estimated_value = parseInt(zestimateMatch[1].replace(/,/g, ''))
    }

    // Extract Rent Zestimate (Zillow's rental value estimate)  
    const rentZestimateMatch = content.match(/rent\s*zestimate[:\s]*\$(\d{1,3}(?:,\d{3})*)/i) ||
                              html.match(/rent\s*zestimate[^$]*\$(\d{1,3}(?:,\d{3})*)/i)
    if (rentZestimateMatch) {
      propertyData.rent_estimate = parseInt(rentZestimateMatch[1].replace(/,/g, ''))
      // Also set monthly_rent for backwards compatibility
      propertyData.monthly_rent = parseInt(rentZestimateMatch[1].replace(/,/g, ''))
    }

    // Fallback: Extract any price if Zestimate not found
    if (!propertyData.estimated_value) {
      const priceMatch = content.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i)
      if (priceMatch) {
        propertyData.estimated_value = parseInt(priceMatch[1].replace(/,/g, ''))
      }
    }

    // Extract year built
    const yearMatch = content.match(/(?:built|year)[\s:]*(\d{4})/i)
    if (yearMatch) {
      propertyData.year_built = parseInt(yearMatch[1])
    }

    // Extract lot size
    const lotMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:acre|ac)/i)
    if (lotMatch) {
      propertyData.lot_size = `${lotMatch[1]} acres`
    }

    // Determine property type
    const typeKeywords = {
      'single_family': ['single family', 'house', 'home'],
      'condo': ['condo', 'condominium'],
      'townhouse': ['townhouse', 'townhome'],
      'apartment': ['apartment', 'apt'],
      'multi_family': ['duplex', 'triplex', 'fourplex', 'multi-family']
    }

    for (const [type, keywords] of Object.entries(typeKeywords)) {
      if (keywords.some(keyword => content.toLowerCase().includes(keyword))) {
        propertyData.property_type = type
        break
      }
    }

    // Extract property images from HTML
    const imageUrls: string[] = []
    if (html) {
      // Look for Zillow property images in various containers
      const imagePatterns = [
        /<img[^>]+src="([^"]*)"[^>]*(?:class="[^"]*(?:photo|image|picture)[^"]*"|alt="[^"]*(?:photo|image|picture)[^"]*")/gi,
        /<img[^>]+class="[^"]*(?:photo|image|picture)[^"]*"[^>]*src="([^"]*)"/gi,
        /<picture[^>]*>[\s\S]*?<img[^>]+src="([^"]*)"/gi,
        /<div[^>]*class="[^"]*(?:photo|image)[^"]*"[^>]*>[\s\S]*?<img[^>]+src="([^"]*)"/gi
      ]
      
      for (const pattern of imagePatterns) {
        let match
        while ((match = pattern.exec(html)) !== null) {
          const imageUrl = match[1]
          // Filter out non-property images (icons, logos, etc.)
          if (imageUrl && 
              imageUrl.includes('photos.zillowstatic.com') &&
              !imageUrl.includes('icon') &&
              !imageUrl.includes('logo') &&
              !imageUrl.includes('svg') &&
              (imageUrl.includes('.jpg') || imageUrl.includes('.jpeg') || imageUrl.includes('.png') || imageUrl.includes('.webp'))) {
            // Ensure we get high quality images
            const highQualityUrl = imageUrl.replace(/\/[0-9]+_[0-9]+_/, '/1024_768_')
                                           .replace(/\?.*$/, '') // Remove query parameters
            if (!imageUrls.includes(highQualityUrl)) {
              imageUrls.push(highQualityUrl)
            }
          }
        }
      }
      
      // Limit to first 5 images to avoid too many
      propertyData.images = imageUrls.slice(0, 5)
    }

    console.log('Extracted property data:', propertyData)
    
    // Log each field individually to help debug what's being extracted
    console.log('Individual field extraction results:')
    console.log('- Address:', propertyData.address)
    console.log('- City:', propertyData.city)
    console.log('- State:', propertyData.state)
    console.log('- ZIP:', propertyData.zip_code)
    console.log('- Bedrooms:', propertyData.bedrooms)
    console.log('- Bathrooms:', propertyData.bathrooms)
    console.log('- Square Feet:', propertyData.square_feet)
    console.log('- Property Type:', propertyData.property_type)
    console.log('- Estimated Value:', propertyData.estimated_value)
    console.log('- Home Value Estimate (Zestimate):', propertyData.home_value_estimate)
    console.log('- Rent Estimate (Rent Zestimate):', propertyData.rent_estimate)
    console.log('- Images found:', propertyData.images?.length || 0)
    if (propertyData.images?.length > 0) {
      console.log('- First image URL:', propertyData.images[0])
    }
    
    // Also log the raw content to help debug extraction patterns
    console.log('Raw scraped content (first 500 chars):', content.substring(0, 500))
    
  } catch (error) {
    console.error('Error extracting property data:', error)
  }

  return propertyData
}