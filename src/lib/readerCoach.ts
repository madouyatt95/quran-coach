import {useQuranStore} from '../stores/quranStore';
import {useSettingsStore} from '../stores/settingsStore';
import {useReaderCoachStore,type ReaderCoachTask} from '../stores/readerCoachStore';
import {CHAPTERS} from './interactiveMushaf/model';
export function readerCoachTarget(params:URLSearchParams) {
    const task=params.get('coach'),surah=Number(params.get('surah')),ayah=Number(params.get('ayah'));
    if(!['practice','repeat','understand'].includes(task||'')||!Number.isInteger(surah)||!Number.isInteger(ayah)||ayah<1||ayah>(CHAPTERS[surah-1]?.count||0))return null;
    return {task:task as ReaderCoachTask,surah,ayah};
}
/** Called only from an explicit coach action; preserve the original reading location. */
export function prepareReaderCoachTask(task:ReaderCoachTask,surah:number,ayah:number) {
    const q=useQuranStore.getState(),settings=useSettingsStore.getState();
    useReaderCoachStore.getState().remember({surah:q.currentSurah,ayah:q.currentAyah,page:q.currentPage,view:settings.viewMode});
    settings.setViewMode('tajweed-interactive');
    return `/read?surah=${surah}&ayah=${ayah}&coach=${task}`;
}
