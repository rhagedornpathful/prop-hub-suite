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
    property_type: null,
    year_built: null,
    lot_size: null,
    estimated_value: null
  }

  try {
    // Extract address
    const addressMatch = content.match(/(?:Address:|Street:)\s*([^\n\r,]+(?:,\s*[^\n\r,]+)*)/i) ||
                         html.match(/<h1[^>]*>([^<]*(?:St|Ave|Rd|Dr|Ln|Blvd|Way|Ct|Pl)[^<]*)<\/h1>/i)
    if (addressMatch) {
      propertyData.address = addressMatch[1].trim()
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

    // Extract price
    const priceMatch = content.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i)
    if (priceMatch) {
      propertyData.estimated_value = parseInt(priceMatch[1].replace(/,/g, ''))
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

    console.log('Extracted property data:', propertyData)
    
  } catch (error) {
    console.error('Error extracting property data:', error)
  }

  return propertyData
}