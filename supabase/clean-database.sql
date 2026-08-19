-- ================================================================
-- CAMPUS MARKET - NETTOYAGE COMPLET DE LA BASE DE DONNÉES
-- ================================================================
-- ⚠️ ATTENTION: Ce script SUPPRIME TOUT et remet la BD à zéro
-- À exécuter EN PREMIER avant schema-final.sql
-- ================================================================

-- ================================================================
-- STEP 1: DROP TOUS LES TRIGGERS
-- ================================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;

-- ================================================================
-- STEP 2: DROP TOUTES LES FONCTIONS
-- ================================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_profile() CASCADE;

-- ================================================================
-- STEP 3: DROP TOUTES LES TABLES (dans l'ordre inverse des dépendances)
-- ================================================================

DROP TABLE IF EXISTS public.support_ticket_replies CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.admin_logs CASCADE;
DROP TABLE IF EXISTS public.system_alerts CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.shops CASCADE;
DROP TABLE IF EXISTS public.sellers CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- ================================================================
-- STEP 4: DROP TOUS LES TYPES (ENUMS)
-- ================================================================

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.verification_status CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.product_status CASCADE;
DROP TYPE IF EXISTS public.support_ticket_status CASCADE;
DROP TYPE IF EXISTS public.support_ticket_priority CASCADE;
DROP TYPE IF EXISTS public.support_ticket_category CASCADE;
DROP TYPE IF EXISTS public.report_status CASCADE;
DROP TYPE IF EXISTS public.system_alert_severity CASCADE;

-- ================================================================
-- STEP 5: DROP TOUS LES INDEXES
-- ================================================================

DROP INDEX IF EXISTS public.idx_users_email CASCADE;
DROP INDEX IF EXISTS public.idx_users_role CASCADE;
DROP INDEX IF EXISTS public.idx_sellers_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_sellers_verification CASCADE;
DROP INDEX IF EXISTS public.idx_products_shop_id CASCADE;
DROP INDEX IF EXISTS public.idx_products_category_id CASCADE;
DROP INDEX IF EXISTS public.idx_products_status CASCADE;
DROP INDEX IF EXISTS public.idx_orders_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_orders_status CASCADE;
DROP INDEX IF EXISTS public.idx_payments_order_id CASCADE;
DROP INDEX IF EXISTS public.idx_payments_status CASCADE;
DROP INDEX IF EXISTS public.idx_reviews_product_id CASCADE;
DROP INDEX IF EXISTS public.idx_reviews_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_admin_logs_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_admin_logs_resource CASCADE;
DROP INDEX IF EXISTS public.idx_admin_logs_created CASCADE;
DROP INDEX IF EXISTS public.idx_tickets_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_tickets_assigned CASCADE;
DROP INDEX IF EXISTS public.idx_tickets_status CASCADE;
DROP INDEX IF EXISTS public.idx_replies_ticket_id CASCADE;
DROP INDEX IF EXISTS public.idx_reports_user_id CASCADE;
DROP INDEX IF EXISTS public.idx_reports_product_id CASCADE;
DROP INDEX IF EXISTS public.idx_reports_seller_id CASCADE;
DROP INDEX IF EXISTS public.idx_reports_status CASCADE;
DROP INDEX IF EXISTS public.idx_alerts_type CASCADE;
DROP INDEX IF EXISTS public.idx_alerts_severity CASCADE;

-- ================================================================
-- ✅ NETTOYAGE COMPLET TERMINÉ
-- ================================================================
-- Maintenant tu peux exécuter schema-final.sql pour recréer tout proprement
-- ================================================================
