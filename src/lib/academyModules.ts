import {COURSE_LEVELS} from '../academy/data/courseLibrary';
import {LEVEL_1_FONDATIONS} from '../academy/data/level1-fondations';
import {LEVEL_2_PRATIQUE} from '../academy/data/level2-pratique';
export const academyModules=[LEVEL_1_FONDATIONS,LEVEL_2_PRATIQUE,...COURSE_LEVELS].flatMap(l=>l.modules);
