import { render, screen, waitFor } from '../utils/test-utils'
import userEvent from '@testing-library/user-event'
import Auth from '@/pages/Auth'

describe('Auth Page', () => {
  it('renders sign in form by default', () => {
    render(<Auth />)
    
    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('switches to sign up form', async () => {
    const user = userEvent.setup()
    render(<Auth />)
    
    await user.click(screen.getByText(/don't have an account/i))
    
    expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<Auth />)
    
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    render(<Auth />)
    
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
  })
})