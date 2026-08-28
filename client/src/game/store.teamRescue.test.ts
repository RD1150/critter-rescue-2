import { describe, expect, it } from 'vitest';
import { createFreshState, completeTeamRescue } from './store';
import { TEAM_RESCUE } from './teamRescue';

describe('child-led Team Rescue', () => {
  it('records one calm shared rescue and a local keepsake', () => {
    const state = createFreshState();
    const { newState, keepsake } = completeTeamRescue(state, TEAM_RESCUE);
    expect(newState.teamRescueWins[TEAM_RESCUE.id]).toBe(1);
    expect(keepsake.critterName).toContain('Wren');
    expect(newState.keepsakes[0].id).toBe(keepsake.id);
    expect(keepsake.message).toContain('Nutty and Pip');
  });
});
