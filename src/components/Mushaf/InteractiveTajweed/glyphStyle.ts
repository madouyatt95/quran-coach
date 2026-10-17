import type {PaperTheme} from '../../../lib/interactiveMushaf/service';
const TAJWEED_COLORS:Record<string,[string,string]>={
    ham_wasl:['#68717d','#c5cad2'],laam_shamsiyah:['#68717d','#c5cad2'],silent:['#68717d','#c5cad2'],slnt:['#68717d','#c5cad2'],
    idgham_ghunnah:['#68717d','#c5cad2'],idgham_wo_ghunnah:['#68717d','#c5cad2'],idgham_no_ghunnah:['#68717d','#c5cad2'],idgham_shafawi:['#68717d','#c5cad2'],idgham_mutajanisayn:['#68717d','#c5cad2'],idgham_mutaqaribayn:['#68717d','#c5cad2'],
    madda_normal:['#8a6100','#f3cb5c'],madda_permissible:['#a94300','#ff9d5c'],madda_obligatory:['#b51d24','#ff777d'],madda_necessary:['#941b20','#ff8989'],
    ikhafa:['#08723f','#65df9a'],ikhafa_shafawi:['#08723f','#65df9a'],ikhfa:['#08723f','#65df9a'],iqlab:['#08723f','#65df9a'],ghunnah:['#08723f','#65df9a'],qalqalah:['#00689f','#70caff'],tafkheem:['#3546a3','#9ba8ff'],tafkhim:['#3546a3','#9ba8ff']
};
export function fallbackRuleColor(rule:string|null,paper:PaperTheme):string|undefined { return rule?TAJWEED_COLORS[rule.toLowerCase()]?.[paper==='dark'?1:0]:undefined; }
