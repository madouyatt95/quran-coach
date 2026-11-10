// @vitest-environment jsdom
import {expect,it} from 'vitest';
import {openingDestination} from './OpeningPreference';
it('preserves exact reading and course URLs but never opens external persisted URLs',()=>{expect(openingDestination('reading','/read?page=34','/academy')).toBe('/read?page=34');expect(openingDestination('course','/read','/academy?module=abc')).toBe('/academy?module=abc');expect(openingDestination('notebook','/read','/academy')).toBe('/notebook');expect(openingDestination('reading','//evil.test','/academy')).toBe('/');});
