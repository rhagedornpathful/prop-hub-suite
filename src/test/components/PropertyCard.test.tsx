import { render, screen } from '../utils/test-utils'
import { PropertyCard } from '@/components/PropertyCard'
import { mockProperties } from '../utils/test-utils'

describe('PropertyCard Component', () => {
  const mockProperty = mockProperties[0]

  it('renders property information correctly', () => {
    render(<PropertyCard property={mockProperty} />)
    
    expect(screen.getByText('123 Test St')).toBeInTheDocument()
    expect(screen.getByText('Test City, TS 12345')).toBeInTheDocument()
    expect(screen.getByText('2 bed')).toBeInTheDocument()
    expect(screen.getByText('1 bath')).toBeInTheDocument()
    expect(screen.getByText('$1,200/month')).toBeInTheDocument()
  })

  it('handles missing optional fields gracefully', () => {
    const propertyWithoutRent = { ...mockProperty, monthly_rent: null }
    render(<PropertyCard property={propertyWithoutRent} />)
    
    expect(screen.getByText('123 Test St')).toBeInTheDocument()
    expect(screen.queryByText('$')).not.toBeInTheDocument()
  })

  it('displays active status badge', () => {
    render(<PropertyCard property={mockProperty} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()
    
    render(<PropertyCard property={mockProperty} onClick={handleClick} />)
    
    await user.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledWith(mockProperty)
  })
})