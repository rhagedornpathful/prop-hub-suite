import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import FirecrawlApp from 'https://esm.sh/@mendable/firecrawl-js@1.29.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { url, propertyId, updateExisting = false } = await req.json()
    
    console.log('Starting enhanced property scraping for:', { url, propertyId, updateExisting })
    
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY')
    if (!firecrawlApiKey) {
      throw new Error('FIRECRAWL_API_KEY not configured')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const firecrawl = new FirecrawlApp({ apiKey: firecrawlApiKey })

    // Enhanced scraping with Firecrawl v1 API
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html']
    })

    if (!scrapeResult.success) {
      throw new Error('Failed to scrape property data')
    }

    console.log('Raw scraped data:', scrapeResult.data)
    
    // Enhanced data extraction with more comprehensive mapping
    const extractPropertyData = (scrapedData: any): any => {
      const content = scrapedData.markdown || scrapedData.html || ''
      const extractedData = scrapedData.llm_extraction || {}
      
      console.log('Extracted LLM data:', extractedData)
      
      // Enhanced extraction patterns
      const patterns = {
        // Basic property info
        bedrooms: /(\d+)\s*(?:bed|bedroom|br\b)/i,
        bathrooms: /(\d+(?:\.\d+)?)\s*(?:bath|bathroom|ba\b)/i,
        square_feet: /(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft|square\s*feet|sqft)/i,
        
        // Financial information
        price: /\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/,
        estimated_value: /(?:zestimate|estimated?\s*value|home\s*value)[\s:]*\$(\d{1,3}(?:,\d{3})*)/i,
        rent_estimate: /(?:rent\s*zestimate|rental?\s*estimate)[\s:]*\$(\d{1,3}(?:,\d{3})*)/i,
        hoa_fees: /(?:hoa|homeowners?\s*association)[\s:]*\$(\d{1,3}(?:,\d{3})*)/i,
        property_taxes: /(?:property\s*tax|taxes?)[\s:]*\$(\d{1,3}(?:,\d{3})*)/i,
        
        // Property details
        year_built: /(?:built|year\s*built)[\s:]*(\d{4})/i,
        lot_size: /(?:lot\s*size)[\s:]*(\d+(?:\.\d+)?)\s*(?:acres?|sq\.?\s*ft)/i,
        property_type: /(single\s*family|condo|townhouse|duplex|multi\s*family)/i,
        
        // Market information
        days_on_market: /(\d+)\s*days?\s*on\s*(?:market|zillow)/i,
        
        // Location
        address: /^(.+?)(?:\s*,\s*[A-Z]{2}\s*\d{5}|\s*\|\s*Zillow)/m,
        city: /,\s*([^,]+),\s*[A-Z]{2}/,
        state: /,\s*[^,]+,\s*([A-Z]{2})/,
        zip_code: /(\d{5}(?:-\d{4})?)/,
        
        // Scores and ratings
        walkability_score: /walk\s*score[\s:]*(\d+)/i,
        school_rating: /school\s*rating[\s:]*(\d+(?:\.\d+)?)/i,
        
        // Energy efficiency
        energy_efficiency_rating: /(energy\s*star|leed|green\s*certified)/i
      }
      
      const result: any = {}
      
      // Apply patterns to extract data
      for (const [key, pattern] of Object.entries(patterns)) {
        const match = content.match(pattern)
        if (match) {
          let value = match[1] || match[0]
          
          // Clean and convert numeric values
          if (['bedrooms', 'bathrooms', 'square_feet', 'price', 'estimated_value', 'rent_estimate', 'hoa_fees', 'property_taxes', 'year_built', 'days_on_market', 'walkability_score', 'school_rating'].includes(key)) {
            value = parseFloat(value.replace(/,/g, '')) || null
          }
          
          result[key] = value
        }
      }
      
      // Use LLM extraction if available and better
      if (extractedData) {
        Object.assign(result, extractedData)
      }
      
      // Extract images
      const imageMatches = content.match(/https:\/\/[^\s"']+\.(?:jpg|jpeg|png|webp)/gi) || []
      if (imageMatches.length > 0) {
        result.images = imageMatches.slice(0, 10) // Limit to 10 images
      }
      
      // Calculate derived metrics
      if (result.price && result.square_feet) {
        result.price_per_sqft = Math.round((result.price / result.square_feet) * 100) / 100
      }
      
      // Store raw Zillow data for future reference
      result.zillow_data = {
        url,
        scraped_at: new Date().toISOString(),
        raw_content: content.substring(0, 5000), // Store first 5000 chars
        llm_extraction: extractedData
      }
      
      result.last_zillow_sync = new Date().toISOString()
      result.data_sources = { zillow: { last_updated: new Date().toISOString(), url } }
      
      return result
    }
    
    const propertyData = extractPropertyData(scrapeResult.data)
    console.log('Final extracted property data:', propertyData)
    
    return new Response(
      JSON.stringify({
        success: true,
        propertyData,
        message: updateExisting ? 'Property updated with Zillow data' : 'Property data extracted successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
    
  } catch (error) {
    console.error('Error in enhanced property scraping:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: 'Enhanced property scraping failed'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})