// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ParentBuildPromptsScreen from './ParentBuildPromptsScreen';

vi.mock('../game/sounds', () => ({ playButton: vi.fn() }));
afterEach(() => { cleanup(); window.localStorage.clear(); });

describe('ParentBuildPromptsScreen', () => {
  it('prefills a parent template but does not offer it to the child until the adult explicitly saves it', () => {
    render(<ParentBuildPromptsScreen onBack={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Use Leafy bridge template' }));
    expect((screen.getByLabelText('Custom build prompt title') as HTMLInputElement).value).toBe('Leafy bridge');
    expect((screen.getByLabelText('Custom child-facing build idea') as HTMLTextAreaElement).value).toBe('Can you make a leafy bridge for a friend?');
    expect(screen.getByText('Leafy bridge is ready for you to review and save on this device.')).toBeTruthy();
    expect(screen.queryByText('Your studio ideas')).toBeTruthy();
    expect(screen.queryByLabelText('Offer Leafy bridge in Cozy Block Studio')).toBeNull();
  });

  it('keeps a parent-created prompt local and lets the adult choose whether it reaches the studio', () => {
    render(<ParentBuildPromptsScreen onBack={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Custom build prompt title'), { target: { value: 'Soft tunnel' } });
    fireEvent.change(screen.getByLabelText('Custom child-facing build idea'), { target: { value: 'Can you make a soft tunnel for a friend?' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save and offer this idea' }));
    expect(screen.getByText('Your idea is saved on this device and will appear in the studio.')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Offer Soft tunnel in Cozy Block Studio'));
    expect(screen.getByText('Soft tunnel is hidden from Cozy Block Studio.')).toBeTruthy();
  });
});
