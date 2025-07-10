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
    
    // Try multiple URL formats for better success rate
    const searchUrls = [
      `https://www.zillow.com/homes/${encodeURIComponent(address)}_rb/`,
      `https://www.zillow.com/homedetails/${encodeURIComponent(address.replace(/\s+/g, '-'))}`,
      `https://www.zillow.com/homes/for_sale/${encodeURIComponent(address)}`
    ]
    
    let scrapedData = null
    let lastError = null
    
    // Try each URL until we get good data
    for (const searchUrl of searchUrls) {
      try {
        console.log('Attempting to scrape:', searchUrl)
        
        const crawlResponse = await app.scrapeUrl(searchUrl, {
          formats: ['markdown', 'html'],
          waitFor: 3000,
          timeout: 15000
        })

        if (crawlResponse.success && crawlResponse.data) {
          const content = crawlResponse.data.markdown || crawlResponse.data.html || ''
          console.log('Content length:', content.length)
          console.log('Content preview:', content.substring(0, 500))
          
          if (content.length > 100) { // Only use if we got substantial content
            scrapedData = {
              content,
              metadata: crawlResponse.data.metadata || {},
              url: searchUrl
            }
            break
          }
        }
      } catch (error) {
        console.log('Error with URL:', searchUrl, error)
        lastError = error
      }
    }

    if (!scrapedData) {
      console.log('Failed to scrape any URL, last error:', lastError)
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: { 
            address: address,
            street_address: address,
            description: 'Could not automatically fetch property details. Please enter manually.'
          },
          error: 'Could not fetch property data from Zillow'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Enhanced property data extraction
    const extractPropertyData = (content: string, metadata: any) => {
      console.log('Extracting property data from content...')
      
      const propertyData: any = {
        address: address,
        street_address: address,
        description: metadata.description || '',
      }

      // Extract price/value with multiple patterns
      const pricePatterns = [
        /\$([0-9,]+)/g,
        /price[:\s]*\$?([0-9,]+)/gi,
        /value[:\s]*\$?([0-9,]+)/gi,
        /est[imated]*[:\s]*\$?([0-9,]+)/gi
      ]
      
      for (const pattern of pricePatterns) {
        const matches = content.match(pattern)
        if (matches && matches.length > 0) {
          // Get the largest number (likely the property value)
          const prices = matches.map(m => parseInt(m.replace(/[$,]/g, ''))).filter(p => p > 50000)
          if (prices.length > 0) {
            propertyData.estimated_value = Math.max(...prices)
            console.log('Found price:', propertyData.estimated_value)
            break
          }
        }
      }

      // Extract bedrooms with enhanced patterns
      const bedroomPatterns = [
        /(\d+)\s*(?:bed|br|bedroom)s?/gi,
        /bed[room]*s?[:\s]*(\d+)/gi,
        /(\d+)\s*bd/gi
      ]
      
      for (const pattern of bedroomPatterns) {
        const match = content.match(pattern)
        if (match) {
          const beds = parseInt(match[1])
          if (beds > 0 && beds <= 20) {
            propertyData.bedrooms = beds
            console.log('Found bedrooms:', beds)
            break
          }
        }
      }

      // Extract bathrooms with enhanced patterns
      const bathroomPatterns = [
        /(\d+(?:\.\d+)?)\s*(?:bath|ba|bathroom)s?/gi,
        /bath[room]*s?[:\s]*(\d+(?:\.\d+)?)/gi,
        /(\d+(?:\.\d+)?)\s*ba/gi
      ]
      
      for (const pattern of bathroomPatterns) {
        const match = content.match(pattern)
        if (match) {
          const baths = parseFloat(match[1])
          if (baths > 0 && baths <= 20) {
            propertyData.bathrooms = baths
            console.log('Found bathrooms:', baths)
            break
          }
        }
      }

      // Extract square feet with enhanced patterns
      const sqftPatterns = [
        /(\d{1,3}(?:,\d{3})*)\s*(?:sq\s*ft|sqft|square\s*feet)/gi,
        /(?:size|area)[:\s]*(\d{1,3}(?:,\d{3})*)\s*(?:sq\s*ft|sqft)/gi,
        /(\d{1,3}(?:,\d{3})*)\s*sf/gi
      ]
      
      for (const pattern of sqftPatterns) {
        const match = content.match(pattern)
        if (match) {
          const sqft = parseInt(match[1].replace(/,/g, ''))
          if (sqft > 200 && sqft < 50000) {
            propertyData.square_feet = sqft
            console.log('Found square feet:', sqft)
            break
          }
        }
      }

      // Extract year built
      const yearPatterns = [
        /(?:built|year)[:\s]*(\d{4})/gi,
        /(\d{4})\s*built/gi,
        /year[:\s]*(\d{4})/gi
      ]
      
      for (const pattern of yearPatterns) {
        const match = content.match(pattern)
        if (match) {
          const year = parseInt(match[1])
          const currentYear = new Date().getFullYear()
          if (year > 1800 && year <= currentYear) {
            propertyData.year_built = year
            console.log('Found year built:', year)
            break
          }
        }
      }

      // Extract property type
      const typePatterns = [
        /(?:property\s*type|type)[:\s]*(single\s*family|condo|townhouse|apartment|multi\s*family)/gi,
        /(single\s*family|condo|townhouse|apartment|multi\s*family)\s*home/gi,
        /(house|condo|townhouse|apartment)/gi
      ]
      
      for (const pattern of typePatterns) {
        const match = content.match(pattern)
        if (match) {
          propertyData.property_type = match[1].toLowerCase().replace(/\s+/g, '_')
          console.log('Found property type:', propertyData.property_type)
          break
        }
      }

      console.log('Extracted property data:', propertyData)
      return propertyData
    }

    const propertyData = extractPropertyData(scrapedData.content, scrapedData.metadata)

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: propertyData,
        rawContent: scrapedData.content.substring(0, 1000) // First 1000 chars for debugging
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