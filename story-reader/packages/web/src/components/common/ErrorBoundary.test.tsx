import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

function BrokenComponent(): React.ReactElement {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders a fallback when a child crashes', () => {
    render(
      <ErrorBoundary>
        <BrokenComponent />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { name: /co loi hien thi/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /thu lai/i })).toBeInTheDocument();
  });
});
