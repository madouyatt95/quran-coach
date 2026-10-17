import {TAJWEED_RULES} from '../../academy/data/tajweed-rules';
import type {MushafWord} from './model';
// Only explicit source tags with an existing lesson. Never derive a rule from a font color.
export const PAGE_LESSON_TAGS:Record<string,string>={qalqalah:'qalqalah',ghunnah:'ghunna',ikhfa:'ikhfa',iqlab:'iqlab',madda_normal:'madd-tabii',idgham_ghunnah:'idgham',idgham_wo_ghunnah:'idgham'};
export function pageLessons(words:MushafWord[]) {
    return TAJWEED_RULES.flatMap(lesson=>{
        const examples=words.filter(word=>word.kind==='word'&&word.tajweedSegments.some(s=>s.rule&&PAGE_LESSON_TAGS[s.rule]===lesson.id&&s.text.trim()));
        return examples.length?[{...lesson,examples}]:[];
    });
}
export function matchesPageLesson(word:MushafWord,lesson:string) {
    return word.kind==='word'&&word.tajweedSegments.some(s=>s.rule&&PAGE_LESSON_TAGS[s.rule]===lesson&&s.text.trim());
}
