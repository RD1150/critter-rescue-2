// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TracingPuzzle } from './RescueScreen';

const pointFor = (index: number, count = 7) => {
  const t = index / (count - 1);
  return { x: 20 + t * (360 - 40), y: 90 + Math.sin(t * Math.PI * 2.5) * (180 * 0.35) };
};

const renderPuzzle = (onComplete = vi.fn()) => {
  const result = render(<TracingPuzzle difficulty={1} onComplete={onComplete} />);
  const svg = result.container.querySelector('svg');
  if (!svg) throw new Error('Expected tracing SVG');
  return { ...result, svg, onComplete };
};

describe('TracingPuzzle', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders a high-contrast dashed route and only the followed dots in the completed segment', () => {
    const { container, svg } = renderPuzzle();
    const paths = () => Array.from(container.querySelectorAll('path'));
    const route = paths()[0];
    expect(route.getAttribute('stroke')).toBe('#FFF9EF');
    expect(route.getAttribute('stroke-dasharray')).toBe('1 12');
    expect(route.getAttribute('stroke-width')).toBe('6');

    const dots = Array.from(container.querySelectorAll('[role="button"]'));
    fireEvent.click(dots[0]);
    expect(paths()[1].getAttribute('d')).toBe('M20,90');
    expect(paths()[1].getAttribute('d')).not.toContain('73.33333333333333');
    expect(svg.querySelectorAll('[role="button"]')[1].getAttribute('aria-disabled')).toBe('false');
  });

  it('accepts sequential taps and invokes completion exactly once', () => {
    const { container, onComplete } = renderPuzzle();
    const dots = Array.from(container.querySelectorAll('[role="button"]'));
    dots.forEach(dot => fireEvent.click(dot));
    fireEvent.click(dots[6]);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('follows a touch drag with buttons=0 using SVG-relative coordinates', () => {
    const { container, svg, onComplete } = renderPuzzle();
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 50, right: 460, bottom: 230, width: 360, height: 180,
      x: 100, y: 50, toJSON: () => ({}),
    });
    const points = Array.from({ length: 7 }, (_, i) => pointFor(i));
    fireEvent.pointerDown(svg, { pointerId: 1, buttons: 0, clientX: 100 + points[0].x, clientY: 50 + points[0].y });
    points.slice(1).forEach(point => {
      fireEvent.pointerMove(svg, { pointerId: 1, buttons: 0, clientX: 100 + point.x, clientY: 50 + point.y });
    });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('stops a cancelled drag from accepting later pointer movement', () => {
    const { container, svg } = renderPuzzle();
    vi.spyOn(svg, 'getBoundingClientRect').mockReturnValue({
      left: 100, top: 50, right: 460, bottom: 230, width: 360, height: 180,
      x: 100, y: 50, toJSON: () => ({}),
    });
    const first = pointFor(0);
    const second = pointFor(1);
    fireEvent.pointerDown(svg, { pointerId: 2, buttons: 0, clientX: 100 + first.x, clientY: 50 + first.y });
    fireEvent.pointerCancel(svg, { pointerId: 2 });
    fireEvent.pointerMove(svg, { pointerId: 2, buttons: 0, clientX: 100 + second.x, clientY: 50 + second.y });
    expect(container.querySelectorAll('path')[1].getAttribute('d')).toBe('M20,90');
  });

  it('supports Enter and Space as keyboard alternatives for the next dot', () => {
    const { container, svg } = renderPuzzle();
    fireEvent.keyDown(svg, { key: 'Enter' });
    fireEvent.keyDown(svg, { key: ' ' });
    const second = pointFor(1);
    expect(container.querySelectorAll('path')[1].getAttribute('d')).toBe(`M20,90 L${second.x},${second.y}`);
  });
});
