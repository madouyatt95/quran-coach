import { describe, expect, it } from 'vitest';
import { SearchEndpoint } from './searchEndpoint';
const chunk = (seconds: number, volume = 0) => new Float32Array(Math.round(seconds * 16000)).fill(volume);
describe('voice search automatic ending', () => {
  it('keeps natural pauses and finishes after a longer silence', () => {
    const endpoint = new SearchEndpoint();
    expect(endpoint.push(chunk(1, 0.08))).toBe(false);
    expect(endpoint.push(chunk(1.5))).toBe(false);
    expect(endpoint.push(chunk(1, 0.08))).toBe(false);
    expect(endpoint.push(chunk(2))).toBe(false);
    expect(endpoint.push(chunk(0.6))).toBe(true);
    expect(endpoint.push(chunk(1))).toBe(false);
  });
  it('does not mistake a brief click for recitation', () => {
    const endpoint = new SearchEndpoint();
    expect(endpoint.push(chunk(0.1, 0.4))).toBe(false);
    expect(endpoint.push(chunk(3))).toBe(false);
    expect(endpoint.push(chunk(9))).toBe(true);
  });
  it('bounds listening even when background noise never stops', () => {
    const endpoint = new SearchEndpoint();
    expect(endpoint.push(chunk(29, 0.08))).toBe(false);
    expect(endpoint.push(chunk(1, 0.08))).toBe(true);
  });
});
