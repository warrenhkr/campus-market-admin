# Relations entre les deux projets — Campus Market

Ce document explique comment `campus-market` (site principal, public) et
`campus-market-admin` (back-office) s'articulent, pour repartir sans tout
redécouvrir.

## 1. Une seule base de données, deux applications

Les deux projets pointent vers la **même base Postgres Supabase**
(confirmé : mêmes `DATABASE_URL`/`DIRECT_URL`, et la fonction Postgres
`is_admin()` définie dans `campus-market-admin/supabase/schema.sql`
interroge directement la table `users` réelle, partagée).

- **`campus-market`** : site public — acheteurs, vendeurs, paiements,
  vitrine boutique/produit. C'est ici que vivent toutes les migrations
  Prisma versionnées (`prisma/migrations/`).
- **`campus-market-admin`** : back-office — modération, validation,
  support, analytics. Utilise `prisma db push` (pas de dossier
  `migrations/`), donc aucune migration n'a jamais été créée depuis ce
  projet — il consomme le schéma, il ne le fait pas évoluer.

Règle à garder : le schéma Prisma (`prisma/schema.prisma`) du projet
principal est la source de vérité. Le schéma de l'admin doit être une
copie conforme — je l'ai resynchronisée dans cette livraison (il datait
d'avant même le début de mon travail sur ce projet : pas de couleurs de
boutique, pas de original_price/promo_label/type/metadata sur Product,
aucune des 6 tables ajoutées cette session). Ne jamais lancer
`prisma db push` depuis l'admin avec un schéma qui aurait à nouveau
divergé — ça peut supprimer en production des colonnes/tables utilisées
par le principal.

## 2. Ce qui a été ajouté côté principal cette session, et son usage admin

- Variantes produit (ProductVariant) : pas encore consommé côté admin —
  à ajouter si la modération produit doit montrer les variantes.
- Zones de livraison (ProductDeliveryZone) : idem, non consommé.
- Split de paiement par vendeur (PaymentSplit) : important —
  actions/finance.ts et actions/payments.ts agrègent encore
  Payment.platform_fee / seller_earning (le total de la commande, tous
  vendeurs confondus). C'est correct pour une vue globale plateforme
  (chiffre d'affaires total), mais si l'admin doit un jour afficher le
  détail par vendeur, il faudra agréger PaymentSplit et non Payment.
- FAQ produit (ProductFaq) : non consommé — la modération produit
  pourrait vouloir vérifier le contenu des FAQ.
- Tarifs alternatifs (ProductPricingTier) : non consommé.
- Avis vérifiés + réponse vendeur (Review.is_verified_purchase,
  Review.seller_reply) : fait cette session — getAllReviews et
  ReviewsTable les affichent maintenant.
- Masquage d'avis (Review.is_hidden, nouveau) : fait cette session —
  comble un TODO explicite laissé dans actions/reviews.ts (hideReview
  ne persistait rien auparavant). Ajouté unhideReview. Le principal
  filtre désormais is_hidden: false sur la page produit et la page
  boutique publique.
- Slug produit, exclusivité, réappro auto, protection fichier, SEO
  dédié (~15 colonnes sur Product) : non consommé côté admin, pas
  d'action requise à court terme.
- Commission par plan (5/2/0/1.5%, lib/subscription-plans.ts côté
  principal) : vérifié cohérent — assignProPlan (admin) change juste
  subscription_plan en base ; le principal recalcule la commission à
  chaque achat en lisant ce champ en direct, pas de désynchronisation
  possible.

## 3. Fonctionnalités déjà bien couvertes côté admin (ne pas dupliquer)

Vérifié dans le vrai code, pas seulement la doc :
- Modération produit (approveProduct / rejectProduct / hideProduct) —
  fonctionnelle.
- Validation vendeur (verification_status PENDING/APPROVED/REJECTED) —
  fonctionnelle.
- Gestion des rôles utilisateurs (USER/SELLER/ADMIN) — fonctionnelle.
- Remboursements, suspension de boutique, changement de plan
  d'abonnement — fonctionnels.
- Sécurité : assertAdmin() + RPC Postgres is_admin() sur toutes les
  actions sensibles.

## 4. Points de vigilance non résolus, à trancher

- RLS absent sur les 6 nouvelles tables ajoutées cette session
  (product_variants, product_delivery_zones, payment_splits,
  product_faqs, product_pricing_tiers, store_media). Sans conséquence
  aujourd'hui (tout passe par Prisma côté serveur avec la clé
  service_role, qui bypass RLS), mais à traiter avant toute exposition
  via l'API Supabase directe (REST/Realtime avec clé anon).
- toggleShopSuspension dupliqué à l'identique dans actions/shops.ts et
  actions/subscriptions.ts — non corrigé pour ne pas casser
  d'appelants existants sans vérification complète.
- @prisma/adapter-pg listé dans package.json (admin) mais jamais
  utilisé dans le code — dépendance orpheline, probablement un essai
  antérieur. Laissée en place, à nettoyer si confirmé inutile.
- Endpoints de debug côté principal (/api/test-auth, /api/test-user) —
  toujours présents, jamais retirés sans confirmation.
- Webhook FedaPay en sandbox (sandbox-api.fedapay.com, en dur dans le
  code principal) — à vérifier si le compte est passé en production
  avant un vrai lancement.
- Espace admin non testé en conditions réelles par moi : je n'ai jamais
  pu exécuter npm install / prisma generate / prisma db push dans mon
  environnement (pas d'accès réseau à binaries.prisma.sh ni à la base
  Supabase) — la resynchronisation du schéma est vérifiée par
  lecture/comparaison rigoureuse du code, pas par exécution réelle.

## 5. Ordre de mise en route recommandé

1. Dans campus-market (principal) : npm install, restaurer le .env,
   npx prisma migrate deploy, npx prisma generate.
2. Vérifier que le site principal tourne et que les nouvelles
   fonctionnalités (avis, FAQ, export...) marchent en conditions
   réelles.
3. Dans campus-market-admin : npm install, restaurer son .env (mêmes
   DATABASE_URL/DIRECT_URL que le principal), puis npx prisma generate
   (le schéma est déjà resynchronisé dans cette livraison — ne pas
   lancer db push, il n'y a rien à pousser, juste à générer le client à
   partir du schéma déjà à jour).
4. Vérifier la modération des avis (nouveau bouton masquer/republier)
   en conditions réelles.
