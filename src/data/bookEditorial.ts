/** Editorial bridges based on the subjects explicitly covered by the published manuscripts.
 * A shared theme is not a claim that the protagonists met or shared an event. */
export const bookConnections = [
 {ids:['musa','musa-apres-la-mer','khidr'],reason:'Retrouvez Moussa à une autre étape de son parcours.'},
 {ids:['ibrahim','hajar-zamzam'],reason:'Poursuivez l’histoire de cette famille autour d’Ibrahim et d’Ismail.'},
 {ids:['sulayman','royaumes-et-justice'],reason:'Explorez un autre récit consacré au pouvoir et à la justice.'},
 {ids:['hijra-route','abu-bakr-confiance','asma-liens'],reason:'Découvrez l’Hégire à travers d’autres personnes qui y prennent part.'},
 {ids:['hudaybiyya-pacte','umm-salama-sagesse','sira-confiance'],reason:'Découvrez Hudaybiyya à travers d’autres passages et témoignages.'},
 {ids:['revelation-lettre','khadija-soutien'],reason:'Retrouvez les débuts de la révélation et le soutien de Khadija.'},
 {ids:['uthman-transmission','zayd-thabit-confie'],reason:'Découvrez un autre acteur de la transmission écrite du Coran.'},
 {ids:['ali-proximite','fatima-proximite'],reason:'Retrouvez la vie de ce foyer à travers l’autre biographie.'},
 {ids:['abu-bakr-confiance','umar-responsabilite','uthman-transmission','ali-proximite'],reason:'Poursuivez la découverte des premiers califes et de leurs responsabilités.'},
 {ids:['kaab-verite','route-du-retour','adam'],reason:'Un autre récit pour réfléchir à la faute, au repentir et au retour.'},
 {ids:['aicha-innocence','parole-juste','jourayj-apparences'],reason:'Poursuivez votre réflexion sur les paroles, les apparences et la vérité.'},
 {ids:['salman-recherche','equilibre-droits'],reason:'Retrouvez Salman et l’attention portée aux droits de chacun.'},
 {ids:['abu-hurayra-memoire','portes-hospitalite'],reason:'Retrouvez Abu Hurayra et le récit de la coupe de lait.'},
 {ids:['abou-dharr-recherche','salman-recherche'],reason:'Deux parcours différents de recherche et d’entrée dans la foi.'},
 {ids:['jabir-attention','portes-hospitalite','gestes-qui-comptent','bois-confie-mer'],reason:'Un autre récit sur l’attention aux besoins et les engagements envers autrui.'},
 {ids:['biens-et-coeur','trois-bienfaits','trois-et-rocher'],reason:'Explorez une autre manière de recevoir, partager ou rendre un bien.'},
 {ids:['nuh','yusuf','voix-epreuve','lut','cave','garcon-et-roi'],reason:'Découvrez une autre histoire de persévérance dans l’épreuve.'},
 {ids:['musab-transmettre','muadh-enseigner','ibn-abbas-comprendre','anas-presence','luqman-conseils'],reason:'Poursuivez la découverte des chemins de l’apprentissage et de la transmission.'},
];
export function editorialConnection(from:string,to:string){return bookConnections.find(g=>g.ids.includes(from)&&g.ids.includes(to))?.reason;}

/** A date is displayed only alongside the exact manuscript passage supporting it.
 * Unlisted chapters retain relative narrative order, without inferred dates. */
export const bookDateAnchors:Record<string,Record<string,{label:string;quote:string}>>={
 'umar-responsabilite':{succession:{label:'634 · 13 H',quote:'En l’an treize de l’Hégire, correspondant à 634, Abu Bakr tombe malade.'},charge:{label:'Vers 18 H · datation historique',quote:'généralement rattachée à l’an dix-huit de l’Hégire'},confier:{label:'644 · 23 H',quote:'Après sa mort, en 644, la consultation se poursuit et conduit au choix d’Uthman.'}},
 'abu-bakr-confiance':{califat:{label:'632–634 · 11–13 H',quote:'Son gouvernement commence en l’an onze de l’Hégire, en 632.'}},
 'uthman-transmission':{califat:{label:'644 · 23 H',quote:'devient le troisième calife en 644'},siege:{label:'656 · 35 H',quote:'Uthman est tué en l’an trente-cinq de l’Hégire, en 656.'}},
 'ali-proximite':{califat:{label:'656–661 · 35–40 H',quote:'Le gouvernement d’Ali se déroule entre 35 et 40 de l’Hégire, de 656 à 661.'}},
};
