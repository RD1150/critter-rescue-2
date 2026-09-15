// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ParentLegalScreen from './ParentLegalScreen';

vi.mock('../game/sounds', () => ({ playButton: vi.fn() }));

afterEach(cleanup);

describe('ParentLegalScreen', () => {
  it('makes the privacy description and adult-review notice available', () => {
    render(<ParentLegalScreen page="privacy" onBack={vi.fn()} onNavigate={vi.fn()} />);
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeTruthy();
    expect(screen.getByText(/does not ask children for names/i)).toBeTruthy();
    expect(screen.getByText(/qualified attorney review/i)).toBeTruthy();
  });

  it('keeps FAQs and page navigation accessible for a grown-up', () => {
    const onNavigate = vi.fn();
    render(<ParentLegalScreen page="faq" onBack={vi.fn()} onNavigate={onNavigate} />);
    expect(screen.getByText('Are Cozy Block Studio builds shared online?')).toBeTruthy();
    fireEvent.click(within(screen.getByRole('navigation', { name: 'Parent information pages' })).getByRole('button', { name: 'Privacy' }));
    expect(onNavigate).toHaveBeenCalledWith('privacy');
  });

  it('uses the supplied protected parent-settings return action', () => {
    const onBack = vi.fn();
    render(<ParentLegalScreen page="privacy" onBack={onBack} onNavigate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Back to Parent Settings' }));
    expect(onBack).toHaveBeenCalledOnce();
  });
});
