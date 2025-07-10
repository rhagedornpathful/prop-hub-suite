import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@1.29.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { address } = await req.json()
    
    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get Firecrawl API key from secrets
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      return new Response(
        JSON.stringify({ error: 'Firecrawl API key not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const app = new FirecrawlApp({ apiKey: firecrawlApiKey })
    
    // Search for the property on Zillow
    const searchUrl = `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`
    
    console.log('Scraping property data from:', searchUrl)
    
    const crawlResponse = await app.scrapeUrl(searchUrl, {
      formats: ['markdown', 'html'],
      waitFor: 2000
    })

    if (!crawlResponse.success) {
      return new Response(
        JSON.stringify({ error: 'Failed to scrape property data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Extract property information from the scraped content
    const content = crawlResponse.data?.markdown || ''
    const metadata = crawlResponse.data?.metadata || {}
    
    // Parse property details using regex patterns and content analysis
    const extractPropertyData = (content: string, metadata: any) => {
      const propertyData: any = {
        address: address,
        street_address: address,
        description: metadata.description || '',
      }

      // Extract price/value
      const priceMatch = content.match(/\$[\d,]+/g)
      if (priceMatch && priceMatch.length > 0) {
        const price = priceMatch[0].replace(/[$,]/g, '')
        propertyData.estimated_value = parseInt(price)
      }

      // Extract bedrooms
      const bedroomMatch = content.match(/(\d+)\s*(?:bed|br|bedroom)/i)
      if (bedroomMatch) {
        propertyData.bedrooms = parseInt(bedroomMatch[1])
      }

      // Extract bathrooms
      const bathroomMatch = content.match(/(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)/i)
      if (bathroomMatch) {
        propertyData.bathrooms = parseFloat(bathroomMatch[1])
      }

      // Extract square feet
      const sqftMatch = content.match(/(\d{1,3}(?:,\d{3})*)\s*(?:sq\s*ft|sqft|square\s*feet)/i)
      if (sqftMatch) {
        propertyData.square_feet = parseInt(sqftMatch[1].replace(/,/g, ''))
      }

      // Extract year built
      const yearMatch = content.match(/(?:built|year)\s*:?\s*(\d{4})/i)
      if (yearMatch) {
        propertyData.year_built = parseInt(yearMatch[1])
      }

      // Extract property type
      const typeMatch = content.match(/(?:property\s*type|type)\s*:?\s*(single\s*family|condo|townhouse|apartment|multi\s*family)/i)
      if (typeMatch) {
        propertyData.property_type = typeMatch[1].toLowerCase().replace(/\s+/g, '_')
      }

      return propertyData
    }

    const propertyData = extractPropertyData(content, metadata)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: propertyData,
        rawContent: content.substring(0, 1000) // First 1000 chars for debugging
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in scrape-property function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})