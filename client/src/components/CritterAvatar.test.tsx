// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import CritterAvatar from './CritterAvatar';

describe('CritterAvatar', () => {
  it('replaces a failed plush image with a consistent labelled avatar instead of broken alt text', () => {
    render(<CritterAvatar type="fox" size={48} />);
    fireEvent.error(screen.getByAltText('fox'));
    expect(screen.getByRole('img', { name: 'fox plush friend' })).toBeTruthy();
    expect(screen.getByText('F')).toBeTruthy();
  });
});
