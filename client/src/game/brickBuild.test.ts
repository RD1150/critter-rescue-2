import { describe, expect, it } from 'vitest';
import { getZoneTask, getZoneTaskCount } from './data';
import { BRICK_BUILD_ORDER, BRICK_BUILD_STEPS } from './brickBuild';

describe('Cozy Block Builder', () => {
  it('uses original unbranded blocks in a steady base, walls, roof sequence', () => {
    expect(BRICK_BUILD_ORDER).toEqual(['wideBase', 'coralWalls', 'mossRoof']);
    expect(BRICK_BUILD_STEPS).toHaveLength(3);
    expect(BRICK_BUILD_STEPS.map((step) => step.tool).join(' ')).not.toMatch(/lego/i);
  });

  it('adds Summit’s block builder to the Mountain path', () => {
    expect(getZoneTask('mountain', 8)).toMatchObject({ type: 'brickBuild', taskIndex: 8, critter: { name: 'Summit', type: 'bear' } });
    expect(getZoneTaskCount('mountain')).toBe(9);
  });
});
