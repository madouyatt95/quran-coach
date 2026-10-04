import { create } from 'zustand';
import type { TrackingPosition } from '../lib/tilawa/service';
import type { Passage } from '../lib/learning';
export const useLiveFollowStore = create<{active:boolean;passage:Passage|null;position:TrackingPosition|null}>(() => ({active:false,passage:null,position:null}));
