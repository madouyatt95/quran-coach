import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ReciterAsset {
    reciter_id: string; // reciter_id from mp3quran
    image_url: string;
    image_source: string;
    license_type: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at?: string;
}

interface AssetsState {
    assets: Map<string, ReciterAsset>;
    isLoading: boolean;

    fetchAssets: () => Promise<void>;
    updateAssetStatus: (reciterId: string, status: 'approved' | 'rejected') => Promise<void>;
    addPendingAsset: (asset: ReciterAsset) => Promise<void>;
}

export const useAssetsStore = create<AssetsState>()((set, get) => ({
    assets: new Map(),
    isLoading: false,

    fetchAssets: async () => {
        set({ isLoading: true });
        const { data, error } = await supabase
            .from('reciter_assets')
            .select('*');

        if (!error && data) {
            const assetMap = new Map();
            data.forEach((asset: ReciterAsset) => {
                assetMap.set(asset.reciter_id, asset);
            });
            set({ assets: assetMap, isLoading: false });
        } else {
            set({ isLoading: false });
            console.error('[AssetsStore] Error fetching assets:', error);
        }
    },

    updateAssetStatus: async (reciterId, status) => {
        const { error } = await supabase
            .from('reciter_assets')
            .update({ status })
            .eq('reciter_id', reciterId);

        if (!error) {
            const newMap = new Map(get().assets);
            const asset = newMap.get(reciterId);
            if (asset) {
                newMap.set(reciterId, { ...asset, status });
                set({ assets: newMap });
            }
        }
    },

    addPendingAsset: async (asset) => {
        const { error } = await supabase
            .from('reciter_assets')
            .upsert(asset, { onConflict: 'reciter_id' });

        if (!error) {
            const newMap = new Map(get().assets);
            newMap.set(asset.reciter_id, asset);
            set({ assets: newMap });
        }
    }
}));
