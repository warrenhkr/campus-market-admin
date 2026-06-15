-- ================================================================
-- FIX: AJOUTER LES COLONNES STATUS MANQUANTES
-- ================================================================

-- Ajouter status à products (s'il n'existe pas)
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS status public.product_status DEFAULT 'APPROVED'::public.product_status NOT NULL;

-- Ajouter status à support_tickets (s'il n'existe pas)
ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS status public.support_ticket_status DEFAULT 'OPEN'::public.support_ticket_status NOT NULL;

-- Ajouter status à reports (s'il n'existe pas)
ALTER TABLE public.reports
ADD COLUMN IF NOT EXISTS status public.report_status DEFAULT 'PENDING'::public.report_status NOT NULL;

-- ================================================================
-- CRÉER LES INDEXES (après avoir ajouté les colonnes)
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- ================================================================
-- DONE ✅
-- ================================================================
