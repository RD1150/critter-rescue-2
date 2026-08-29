// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BetaFeedbackModal from './BetaFeedbackModal';

describe('BetaFeedbackModal', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('submits an adult-only beta suggestion and confirms the result', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });
    vi.stubGlobal('fetch', fetchMock);
    render(<BetaFeedbackModal open onOpenChange={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: /an idea/i }));
    fireEvent.change(screen.getByPlaceholderText(/tell us what you noticed/i), { target: { value: 'Please add a little more spacing near the camp buttons.' } });
    fireEvent.click(screen.getByRole('button', { name: /send feedback/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/beta-feedback', expect.objectContaining({ method: 'POST' })));
    expect(await screen.findByText(/your note is safely on its way/i)).toBeTruthy();
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({ kind: 'suggestion', context: 'Parent Settings · beta' });
  });
});
