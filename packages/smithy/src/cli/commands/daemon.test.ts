import { afterEach, describe, expect, it, vi } from 'vitest';
import { daemonStopCommand } from './daemon.js';

afterEach(() => vi.unstubAllGlobals());

describe('daemon stop server status contract', () => {
  it.each([
    { isRunning: true },
    { running: true },
    { status: 'running' },
  ])('stops a running daemon reported as %j', async (status) => {
    const fetch = vi.fn()
      .mockResolvedValueOnce(Response.json(status))
      .mockResolvedValueOnce(Response.json({ isRunning: false }));
    vi.stubGlobal('fetch', fetch);

    const result = await daemonStopCommand.handler([], { force: true, json: true });
    expect(result.exitCode).toBe(0);
    expect(fetch.mock.calls.map(([url]) => url)).toEqual([
      'http://localhost:3457/api/daemon/status',
      'http://localhost:3457/api/daemon/stop',
    ]);
  });

  it('does not stop when isRunning is explicitly false', async () => {
    const fetch = vi.fn().mockResolvedValue(Response.json({ isRunning: false, running: true }));
    vi.stubGlobal('fetch', fetch);
    await daemonStopCommand.handler([], { force: true, json: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
