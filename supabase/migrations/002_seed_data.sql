-- ============================================================
-- SafeLine — Données initiales : types EPI + réglementation
-- ============================================================

-- Types d'équipements avec règles légales françaises/européennes
insert into equipment_types (name, category, max_lifetime_years, max_use_lifetime_years, inspection_interval_months, norm_reference, retire_after_fall, description) values
('Harnais antichute', 'Protection antichute', 10, 10, 12, 'EN 361', false, 'Harnais complet de maintien du corps. Inspection visuelle avant chaque utilisation, vérification par personne compétente annuelle.'),
('Longe de sécurité', 'Protection antichute', 10, 10, 12, 'EN 354', false, 'Longe de connexion entre harnais et point d''ancrage. Retirer immédiatement si utilisée lors d''une chute.'),
('Absorbeur d''énergie', 'Protection antichute', 10, 10, 12, 'EN 355', true, 'Absorbeur d''énergie intégré à la longe. À remplacer obligatoirement après activation lors d''une chute.'),
('Corde de travail semi-statique', 'Corde', 10, 5, 12, 'EN 1891', false, 'Corde de progression et de travail. Durée maximale 5 ans depuis mise en service ou 10 ans depuis fabrication.'),
('Corde dynamique', 'Corde', 10, 5, 12, 'EN 892', true, 'Corde d''assurance dynamique. Nombre de chutes leader limité selon fabricant. Retirer après chute facteur 2.'),
('Corde de sécurité (longe coulissante)', 'Corde', 10, 5, 12, 'EN 1891 type B', false, 'Corde de sécurité secondaire obligatoire en technique cordiste.'),
('Casque travaux en hauteur', 'Protection tête', 10, 5, 12, 'EN 12492', false, 'Casque avec protection latérale pour travaux en hauteur. Remplacer après choc même sans dommage visible.'),
('Casque industrie', 'Protection tête', 10, 4, 12, 'EN 397', false, 'Casque de protection industrielle. Vérifier l''absence de fissure et de vieillissement UV.'),
('Descendeur', 'Matériel de descente', null, null, 12, 'EN 12278', false, 'Dispositif de descente sur corde. Vérification annuelle par personne compétente. Pas de durée de vie fixe mais retrait si usure.'),
('Bloqueur de poignée (jumard)', 'Matériel de remontée', null, null, 12, 'EN 12841 type B', false, 'Bloqueur dorsal ou de poignée pour remontée sur corde. Vérification des cames et ressorts.'),
('Bloqueur dorsal', 'Matériel de remontée', null, null, 12, 'EN 12841 type C', false, 'Bloqueur de sécurité sur corde de travail. Vérification annuelle obligatoire.'),
('Mousqueton à vis', 'Connecteur', null, null, 12, 'EN 362', true, 'Connecteur de liaison. Retirer immédiatement si chargé dynamiquement ou chute. Vérifier le verrouillage.'),
('Mousqueton à verrouillage automatique', 'Connecteur', null, null, 12, 'EN 362', true, 'Connecteur à verrouillage automatique triple action. Retirer après chute dynamique.'),
('Maillon rapide', 'Connecteur', null, null, 12, 'EN 362', false, 'Maillon de liaison permanent. Vérifier le serrage au couple recommandé.'),
('Poulie simple', 'Poulie', null, null, 12, 'EN 12278', false, 'Poulie de renvoi ou de mouflage. Vérifier l''axe, la joue et la gorge.'),
('Poulie autobloquante', 'Poulie', null, null, 12, 'EN 12278', false, 'Poulie avec came intégrée pour systèmes de mouflage. Vérification came et ressort.'),
('Pédale d''ascension', 'Matériel de remontée', null, null, 12, 'EN 12841', false, 'Pédale ou étrier pour remontée sur corde. Vérification coutures et boucle.'),
('Antichute à rappel automatique', 'Protection antichute', 10, 10, 12, 'EN 360', true, 'Enrouleur antichute automatique. Vérification annuelle obligatoire par organisme agréé. Retrait après déclenchement.'),
('Ligne de vie horizontale', 'Ancrage collectif', 10, 10, 12, 'EN 795 type C', false, 'Ligne de vie horizontale temporaire. Vérification annuelle de l''ensemble du système.'),
('Point d''ancrage mobile', 'Ancrage', 10, 10, 12, 'EN 795 type B', false, 'Ancrage mobile sur rail ou câble. Vérification du système de fixation.'),
('Sac de transport EPI', 'Accessoire', null, null, 12, 'Usage professionnel', false, 'Sac de rangement et transport du matériel cordiste. Vérification coutures et fermetures éclair.');

-- ============================================================
-- Réglementations et obligations légales
-- ============================================================
insert into regulations (title, description, applicable_norm, equipment_category, last_updated, source_url) values
(
  'Vérification annuelle obligatoire des EPI antichute',
  'Tous les équipements de protection individuelle contre les chutes doivent être vérifiés au moins une fois par an par une personne compétente désignée par l''employeur. Cette vérification doit être consignée dans un registre. Les résultats de chaque vérification doivent être conservés jusqu''à la vérification suivante.',
  'Articles R4323-99 à R4323-102 du Code du travail',
  'Protection antichute',
  '2024-01-01',
  'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000018530150'
),
(
  'Retrait immédiat après chute',
  'Tout EPI ayant subi un choc lors d''une chute doit être retiré du service immédiatement et ne plus être utilisé, même en l''absence de dommage apparent. Les absorbeurs d''énergie déclenchés, les mousquetons ayant subi une charge dynamique importante et les antichutes à rappel déclenchés doivent systématiquement être mis au rebut.',
  'EN 355, EN 360, EN 362',
  'Protection antichute',
  '2024-01-01',
  'https://www.inrs.fr/risques/chutes-hauteur/ce-qu-il-faut-retenir.html'
),
(
  'Formation port du harnais — Renouvellement tous les 5 ans',
  'Toute personne utilisant un harnais antichute doit avoir suivi une formation spécifique au port et à l''utilisation des EPI antichute. Cette formation doit être renouvelée au minimum tous les 5 ans. L''INRS recommande un recyclage tous les 3 ans. La formation couvre : réglementation, choix des EPI, vérification, port, ancrage et procédures de secours.',
  'Articles R4323-104 et R4323-106 du Code du travail',
  null,
  '2024-01-01',
  'https://www.inrs.fr/risques/chutes-hauteur/reglementation-travail-hauteur.html'
),
(
  'Durée de vie maximale des cordes',
  'Les cordes semi-statiques (EN 1891) et dynamiques (EN 892) ont une durée de vie maximale de 10 ans depuis la date de fabrication et de 5 ans depuis la mise en service, la date la plus courte étant retenue. En cas d''utilisation intensive ou de conditions difficiles (produits chimiques, UV, chaleur), la durée doit être réduite selon les recommandations du fabricant.',
  'EN 1891, EN 892',
  'Corde',
  '2024-01-01',
  'https://www.petzl.com/FR/fr/Professional/FAQ/duree-de-vie-cordes'
),
(
  'Durée de vie des casques travaux en hauteur',
  'Les casques de travaux en hauteur (EN 12492) ont une durée de vie maximale de 10 ans depuis fabrication et de 5 ans depuis la première mise en service. Ils doivent être remplacés immédiatement après un choc, même sans dommage visible. Le vieillissement des matières plastiques sous l''effet des UV réduit progressivement la résistance.',
  'EN 12492, EN 397',
  'Protection tête',
  '2024-01-01',
  'https://www.inrs.fr/media.html?refINRS=ED%206077'
),
(
  'Registre de sécurité et traçabilité EPI',
  'L''employeur ou le travailleur indépendant doit tenir un registre de sécurité pour tous ses EPI de catégorie III (protection contre les chutes, protection contre la mort). Ce registre doit contenir : identification de chaque EPI (marque, modèle, n° série), dates d''achat et mise en service, historique des vérifications, résultats et nom du vérificateur. Ce registre doit être disponible pour tout contrôle.',
  'Articles R4323-95 à R4323-97 du Code du travail',
  null,
  '2024-01-01',
  'https://www.legifrance.gouv.fr/codes/id/LEGISCTA000018530098'
),
(
  'Travail en hauteur — Principes généraux de prévention',
  'Le travail en hauteur doit respecter les principes généraux de prévention : priorité aux protections collectives (garde-corps, filets) sur les EPI, utilisation d''échafaudages si possible. Les cordes et harnais ne sont autorisés que lorsque les mesures collectives sont techniquement impossibles. Les cordistes professionnels (CQP) réalisent ces travaux dans des conditions particulières encadrées.',
  'Articles R4323-58 à R4323-90 du Code du travail',
  null,
  '2024-01-01',
  'https://www.inrs.fr/risques/chutes-hauteur/reglementation-travail-hauteur.html'
),
(
  'EPI de catégorie III — Obligations de marquage CE',
  'Les EPI antichute sont des EPI de catégorie III (risque mortel). Ils doivent obligatoirement porter le marquage CE avec le numéro de l''organisme notifié, la référence à la norme harmonisée, la date de fabrication et le numéro de série. L''absence de ces marquages interdit l''utilisation de l''équipement.',
  'Règlement UE 2016/425',
  null,
  '2024-01-01',
  'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX%3A32016R0425'
),
(
  'CQP Monteur de réseaux — Qualification cordiste',
  'Les cordistes professionnels doivent justifier d''une certification reconnue. Le CQP1 (Certificat de Qualification Professionnelle) atteste la compétence pour les techniques d''accès et positionnement par cordes. La formation initiale dure minimum 5 jours et les recyclages sont obligatoires. La carte de compétence INPP (Institut National de Plongée Professionnelle) peut également être exigée.',
  'Accord de branche BTP',
  null,
  '2024-01-01',
  'https://www.oppbtp.com/'
),
(
  'Vérification initiale avant première mise en service',
  'Tout EPI neuf doit faire l''objet d''une vérification avant sa première utilisation. Cette vérification initiale porte sur la conformité avec la notice d''instructions, l''absence de défaut apparent, la présence du marquage CE et de la déclaration de conformité. Elle doit être consignée dans le registre de sécurité.',
  'Articles R4323-99 du Code du travail',
  null,
  '2024-01-01',
  'https://www.inrs.fr/risques/chutes-hauteur/ce-qu-il-faut-retenir.html'
);
