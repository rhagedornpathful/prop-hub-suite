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
    const { getByText, queryByText } = render(
      <LoadingState isLoading={true}>
        <div>Content</div>
      </LoadingState>
    );
    
    expect(getByText('Loading...')).toBeInTheDocument();
    expect(queryByText('Content')).not.toBeInTheDocument();
  });

  it('shows custom loading text', () => {
    const { getByText } = render(
      <LoadingState isLoading={true} text="Custom loading">
        <div>Content</div>
      </LoadingState>
    );
    
    expect(getByText('Custom loading')).toBeInTheDocument();
  });
});