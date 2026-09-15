// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ParentContactModal from './ParentContactModal';

vi.mock('@/lib/nativeRuntime', () => ({ resolveNativeNetworkUrl: (url: string) => url }));

describe('ParentContactModal', () => {
  it('requires adult email, useful detail, and the child-data confirmation before submitting', () => {
    render(<ParentContactModal open onOpenChange={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /send parent message/i }));
    expect(screen.getByRole('alert').textContent).toMatch(/email/i);
    fireEvent.change(screen.getByLabelText('Grown-up email'), { target: { value: 'parent@example.com' } });
    fireEvent.change(screen.getByLabelText('Parent contact message'), { target: { value: 'Please help with the quiet sound setting.' } });
    fireEvent.click(screen.getByRole('button', { name: /send parent message/i }));
    expect(screen.getByRole('alert').textContent).toMatch(/confirm/i);
  });
});
