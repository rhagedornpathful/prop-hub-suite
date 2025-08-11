import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LoadingState } from '@/components/ui/loading-state';

describe('LoadingState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when not loading', () => {
    const { getByText } = render(
      <LoadingState isLoading={false}>
        <div>Content loaded</div>
      </LoadingState>
    );
    
    expect(getByText('Content loaded')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    render(
      <LoadingState isLoading={true}>
        <div>Content</div>
      </LoadingState>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows custom loading text', () => {
    render(
      <LoadingState isLoading={true} text="Custom loading">
        <div>Content</div>
      </LoadingState>
    );
    
    expect(screen.getByText('Custom loading')).toBeInTheDocument();
  });
});