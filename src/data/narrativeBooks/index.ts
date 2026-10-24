import {revisedCompanionEdition} from './companionRevisions';
import {completeCompanionBiography} from './companionBiographies';
import { adamBook } from './adam';
import { nuhBook } from './nuh';
import { ibrahimBook } from './ibrahim';
import { yusufBook } from './yusuf';
import { musaBook } from './musa';
import { maryamIsaBook } from './maryamIsa';
import { sulaymanBook } from './sulayman';
import { khidrBook } from './khidr';
import { caveBook } from './cave';
import { wealthBook } from './wealth';
import { musaAfterBook } from './musaAfter';
import { kingsBook } from './kings';
import { callsBook } from './calls';
import { siraBook } from './sira';
import { voicesBook } from './voices';
import { luqmanBook } from './luqman';
import { speechBook } from './speech';
import { lutBook } from './lut';
import { kaabBook } from './kaab';
import { aishaBook } from './aisha';
import { boyKingBook } from './boyKing';
import { rockBook } from './rock';
import { threeTestedBook } from './threeTested';
import { repentanceBook } from './repentance';
import { hajarBook } from './hajar';
import { hijraBook } from './hijra';
import { nightJourneyBook } from './nightJourney';
import { hudaybiyyaBook } from './hudaybiyya';
import { revelationBook } from './revelation';
import { abuDharrBook } from './abuDharr';
import { balanceBook } from './balance';
import { hospitalityBook } from './hospitality';
import { appearancesBook } from './appearances';
import { mercyBook } from './mercy';
import { jabirBook } from './jabir';
import { seaTrustBook } from './seaTrust';
import {abuBakrBook} from './abuBakr';
import {bilalBook} from './bilal';
import {musabBook} from './musab';
import {zaydThabitBook} from './zaydThabit';
import {asmaBook} from './asma';
import {ummSalamaBook} from './ummSalama';
import {umarBook} from './umar';
import {uthmanBook} from './uthman';
import {aliBook} from './ali';
import {khadijaBook} from './khadija';
import {fatimaBook} from './fatima';
import {furtherCompanionBooks} from './companionFurtherBooks';

/** Editorial manuscripts, loaded only by the administrator's book workshop. */
const authoredBooks = [adamBook, nuhBook, ibrahimBook, yusufBook, musaBook, maryamIsaBook, sulaymanBook, khidrBook, caveBook, wealthBook, musaAfterBook, kingsBook, callsBook, siraBook, voicesBook, luqmanBook, speechBook,
 lutBook,kaabBook,aishaBook,boyKingBook,rockBook,threeTestedBook,repentanceBook,hajarBook,hijraBook,nightJourneyBook,hudaybiyyaBook,revelationBook,abuDharrBook,balanceBook,hospitalityBook,appearancesBook,mercyBook,jabirBook,seaTrustBook,abuBakrBook,bilalBook,musabBook,zaydThabitBook,asmaBook,ummSalamaBook,umarBook,uthmanBook,aliBook,khadijaBook,fatimaBook];
/** New recordings are prepared against these editions in the studio. */
export const narrativeProductionBooks=[...authoredBooks,...furtherCompanionBooks].map(revisedCompanionEdition).map(completeCompanionBiography);
/** The current written edition is canonical. Audio is exposed only for its exact manuscript version. */
export const narrativeBooks=narrativeProductionBooks;
