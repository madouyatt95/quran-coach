import { create } from 'zustand';
import type { Passage } from '../lib/learning';
export const useLiveFollowStore = create<{active:boolean;passage:Passage|null}>(() => ({active:false,passage:null}));
