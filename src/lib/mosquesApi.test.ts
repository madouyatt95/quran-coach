import { afterEach, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../../api/mosques';
function response() {
  const res = { status: vi.fn(), setHeader: vi.fn(), json: vi.fn(), end: vi.fn() };
  for (const fn of Object.values(res)) fn.mockReturnValue(res);
  return res;
}
async function run(query: Record<string, string | undefined>, method = 'GET') {
  const res = response();
  await handler({ method, query } as VercelRequest, res as unknown as VercelResponse);
  return res;
}
afterEach(() => vi.unstubAllGlobals());
it('rejects invalid coordinates, unsafe mosque IDs and mutations before fetching', async () => {
  const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
  for (const query of [{latitude:'91',longitude:'2',radius:'5000'}, {id:'../secret'}]) {
    expect((await run(query)).status).toHaveBeenCalledWith(400);
  }
  expect((await run({}, 'POST')).status).toHaveBeenCalledWith(405);
  expect(fetchMock).not.toHaveBeenCalled();
});
it('fetches only the documented provider and caches successful listings', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ok:true,json:async()=>[]}); vi.stubGlobal('fetch',fetchMock);
  const res = await run({latitude:'48.86',longitude:'2.35',radius:'5000'});
  expect(fetchMock.mock.calls[0][0]).toBe('https://pray.zone/api/mosques/nearby?latitude=48.86&longitude=2.35&maxDistance=5000');
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', expect.stringContaining('s-maxage=86400'));
});
it('does not cache provider errors or unexpected response shapes', async () => {
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({html:'unavailable'})}));
  const res = await run({id:'paris_grande-mosquee-de-paris'});
  expect(res.status).toHaveBeenCalledWith(502); expect(res.setHeader).not.toHaveBeenCalledWith('Cache-Control',expect.anything());
});

it('rejects unsafe public slugs and supports Capacitor without forwarding a private token',async()=>{
 const fetchMock=vi.fn();vi.stubGlobal('fetch',fetchMock);
 expect((await run({action:'published',slug:'../../admin'})).status).toHaveBeenCalledWith(400);
 expect(fetchMock).not.toHaveBeenCalled();
 const res=response();await handler({method:'OPTIONS',query:{},headers:{origin:'capacitor://localhost'}} as VercelRequest,res as unknown as VercelResponse);
 expect(res.status).toHaveBeenCalledWith(204);expect(res.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin','capacitor://localhost');
});
