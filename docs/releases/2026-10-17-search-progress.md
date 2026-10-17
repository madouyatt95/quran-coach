# Recherche transversale et sauvegarde des progrès — 17 octobre 2026

## Livré dans l’interface

- Trouve : Coran, hadiths, catalogue complet d’invocations, cours de l’Académie et leurs explications, leçons d’arabe, récits, annotations personnelles (Mushaf, Académie, Fahm, récits, écoute, bibliothèque).
- Filtres par type, contenus déjà étudiés/annotés, pagination des résultats.
- Recherche arabe sans diacritiques, texte d’origine préservé à l’affichage. Les invocations ouvrent leur identifiant exact.
- Une panne du fournisseur Coran donne un état « recherche partielle » et conserve les résultats locaux. Les recherches filtrées sur les notes/cours ne font pas d’appel à la recherche Coran.
- Réglages → Mes progrès, en sécurité : export JSON local, import avec aperçu par rubrique, priorité par rubrique en cas de conflit, ajout des entrées distinctes, restauration des stores en mémoire.
- Avant import : conservation des deux états d’origine, annulation disponible. Le fichier reçu peut être téléchargé à nouveau, ainsi que l’état antérieur des rubriques concernées.
- Les cycles de Khatm distincts ne sont pas additionnés. Les exclusions manuelles sont respectées pour le cycle choisi.
- Fichier personnel non chiffré, à garder dans un emplacement privé. Ni comptes/jetons, ni coordonnées GPS, ni autorisations de notifications. Les caches audio/polices ne sont pas transférés.

## Synchronisation automatique — blocage séparé

Le CLI Supabase existant répond « Invalid access token ». Aucun changement de base distante, aucun envoi de progression ni aucun email d’authentification effectués.

Préparation locale uniquement :
- migration `supabase/migrations/202610170001_private_progress.sql` (table privée par utilisateur, RLS, aucune lecture anonyme) ;
- `progressVault.ts` : chiffrement AES-GCM/PBKDF2 avant transfert, lecture authentifiée, écritures avec révision attendue pour refuser les conflits entre appareils ;
- tests de chiffrement/déchiffrement et d’altération.

Ces éléments ne sont pas branchés dans l’interface publique. La connexion, l’orchestration automatique, les permissions réelles entre deux comptes et la réception des emails restent à intégrer/vérifier après restauration de l’accès administrateur. Le transfert par fichier est la fonction inter-appareils disponible dans cette livraison.

Documentation consultée :
- https://supabase.com/docs/guides/auth/auth-email-passwordless
- https://supabase.com/docs/guides/database/postgres/row-level-security

## Vérification

Tests ciblés : recherche arabe, invocation après la troisième entrée d’un chapitre, résultat exact, panne réseau, notes locales sans appel distant, recherche dans les explications, filtres React, distinction consultation/completion, registre de sauvegarde, aller-retour avec vrais stores (signet, favori, note, SRS), conflits, quota de stockage, rollback, Khatm, chiffrement.

Le contrôle du navigateur intégré est désactivé. Aucun contrôle visuel du nouvel écran ni transfert sur iPhone physique n’est affirmé. Aucune archive iOS native créée : le build Apple déjà en attente de revue n’est pas modifié.

Résultats locaux : 28 tests ciblés réussis, compilation TypeScript et build Vite/PWA réussis. Vérification réelle du fournisseur : « patience » retourne HTTP 200 / 10 résultats ; la requête inexistante retourne HTTP 404 avec le message spécifique « Nothing matching your search was found.. », traité comme un résultat vide et non une panne.

## Publication

Production READY : `dpl_5TUcXeVrvozVtyY1arojo2uP8Yhp`, alias https://www.quran-coach.fr. Vérification HTTP du domaine public : entrée `index-BOxooiHE.js`, nouveau `CoachPage` et `ProgressBackupPanel-C-0lOLbs.js` servis en HTTP 200. Cela confirme la publication des fichiers, sans remplacer le contrôle visuel.

Nouvelle vérification après la réponse utilisateur : contrôle navigateur toujours désactivé et CLI Supabase toujours « Invalid access token ». Synchronisation automatique non activée.

## Reprise du 17 octobre — Supabase et synchronisation

Accès navigateur rétabli puis de nouveau désactivé pendant la configuration de Resend.

- Table `qc_private_progress` créée en production via transaction SQL, RLS activée et quatre politiques par propriétaire vérifiées.
- Test transactionnel avec deux comptes synthétiques réussi : lecture limitée au propriétaire, insertion/écriture dans le compte voisin refusées, révision périmée refusée, accès anonyme refusé. Toute la transaction de test a été annulée ; aucun progrès réel consulté ou envoyé. Script reproductible : `supabase/tests/private_progress_isolation.sql`.
- Implémentation locale `progressSync.ts` et `ProgressSyncPanel.tsx` : connexion par code email, consentement, phrase secrète uniquement en mémoire, synchronisation toutes les 30 secondes quand la page est visible, reprise réseau, rapprochement à trois versions, choix des conflits, prise en compte des suppressions et copie de récupération.
- Interface désactivée par défaut, nécessite `VITE_PROGRESS_SYNC_ENABLED=true`. Ne pas activer avant configuration SMTP, adaptation des templates OTP et test réel de connexion/réception. Ne pas présenter cette étape comme une livraison publique de synchronisation.
- 23 tests ciblés sauvegarde/chiffrement/rapprochement réussis ; TypeScript validé. Test navigateur complet de synchronisation et deux appareils physiques encore à réaliser.
- Premier compte Resend : trois domaines déjà utilisés, ajout refusé sans offre payante. Aucun achat effectué, aucun domaine existant modifié.
- Second compte Resend connecté par l’utilisateur. Formulaire préparé pour `auth.quran-coach.fr`, région Irlande. Domaine pas encore ajouté.
- Vérification Vercel : DNS autoritaires OVH (`dns110.ovh.net`, `ns110.ovh.net`). Les enregistrements email devront être ajoutés chez OVH, pas dans la zone Vercel.
- Aucun email de test envoyé, aucune clé Resend créée, aucun SMTP configuré. Aucune nouvelle publication web/native à cette étape.

## Configuration email finalisée — 17 octobre

Autorisation utilisateur explicite reçue pour les DNS, la clé limitée au sous-domaine, son stockage dans le SMTP Supabase et le code de test à l’adresse Hotmail indiquée.

- Domaine Resend `auth.quran-coach.fr` vérifié, région Irlande. DNS ajoutés chez OVH : TXT `resend._domainkey.auth`, CNAME `rsend.auth` et `send.auth`. Vérifiés sur les serveurs autoritaires puis dans le tableau de bord Resend.
- Clé « Quran Coach Supabase SMTP » créée, permission Sending access restreinte à ce sous-domaine. Clé enregistrée seulement comme mot de passe SMTP Supabase (pas dans le frontend, le dépôt ou un fichier de configuration). Valeur non reproduite dans les preuves.
- SMTP `smtp.resend.com`, port 465, expéditeur `Quran Coach <connexion@auth.quran-coach.fr>`. Paramètres enregistrés avec confirmation de réussite.
- Modèles première connexion et reconnexion remplacés par le modèle français à code `{{ .Token }}`. Source reproductible : `supabase/templates/progress-otp.html`.
- Test réel depuis l’interface locale : demande du code réussie, événement Resend Delivered, code validé dans l’app, compte connecté confirmé. Cela prouve la remise au serveur de messagerie destinataire, sans prouver le classement en boîte principale.
- 39 tests ciblés réussis et build PWA avec synchronisation activée réussi. Aucun test de transfert entre deux iPhone physiques.
- Phrase secrète personnelle laissée à la saisie de l’utilisateur. Aucun secret de chiffrement choisi à sa place, aucun envoi de ses notes ou progrès pendant le test de connexion.
- Publication de l’interface de synchronisation et du complément de confidentialité en attente de réponse. Proposition de politique : `/tmp/qc-privacy-sync-proposed.html`. Production précédente conserve la sauvegarde manuelle.

L’utilisateur a ensuite choisi lui-même sa phrase secrète et activé la synchronisation. Contrôle navigateur : « Vos progrès sont à jour sur cet appareil », date de dernière synchronisation renouvelée automatiquement. Aucune lecture du contenu de ses notes n’a été nécessaire. Publication du complément de confidentialité et activation publique explicitement autorisées. Variables Vercel du projet vérifiées : URL du bon projet Supabase, clé publique de rôle anon (jamais une clé service_role) et activation de la fonction. Build production lancé.

## Publication finale

Production READY `dpl_4edBm9hfsiu73bv2TKapuSVLCAaz`, alias https://www.quran-coach.fr, entrée `index-B8vsXk_d.js`. Vérification HTTP : nouveau panneau avec synchronisation activée et politique enrichie servis depuis le domaine public. Contrôle visuel navigateur du domaine public : bloc « Retrouver mes progrès partout » et bouton « Recevoir mon code de connexion » présents dans Réglages / Sauvegarde après application normale de la mise à jour PWA. Preuve locale `/tmp/qc-sync-production.png` ; preuve remise email `/tmp/qc-email-delivered.png` ; preuve première synchronisation `/tmp/qc-sync-success.png`.

Vérifié réellement : DNS, SMTP enregistré et persisté après rechargement, email remis, code validé, première écriture chiffrée et synchronisations automatiques, affichage public. Limites : pas de test sur deux iPhone physiques, pas d’exécution garantie lorsque iOS suspend l’app, déverrouillage nécessaire après fermeture/rechargement. Aucune nouvelle archive iOS publiée dans cette livraison web/PWA.
