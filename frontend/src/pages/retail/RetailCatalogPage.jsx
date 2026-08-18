import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { MarketingLayout } from "@/components/layout/Layout";
import {
  MarketingSection,
  PageContainer,
} from "@/components/brand/BrandSystem";
import { RetailProductVisual } from "@/components/retail/RetailProductVisual";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { OperationalState } from "@/components/ui/operational-state";
import { Skeleton } from "@/components/ui/skeleton";
import { HAS_CONFIGURED_BACKEND } from "@/lib/api";
import { useI18n } from "@/i18n";
import { getPublicPath } from "@/lib/publicRoutes";
import {
  availabilityLabel,
  formatCatalogPrice,
  publicCatalogApi,
} from "@/lib/catalog";

function ProductTile({ publication, lang, copy }) {
  const { product, variants, category } = publication;

  return (
    <article className="flex h-full flex-col border-t-2 border-brand-secondary pt-4">
      <RetailProductVisual product={product} {...copy.visual} />
      <div className="flex flex-1 flex-col pt-5">
        <p className="type-label text-text-secondary">{category.name}</p>
        <h3 className="mt-2 font-heading text-xl font-bold text-text-primary">
          {product.name}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">
          {product.short_description}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border-default pt-4 text-sm">
          <div>
            <dt className="text-xs text-text-secondary">{copy.priceLabel}</dt>
            <dd className="mt-1 font-semibold text-text-primary">
              {formatCatalogPrice(product, variants, lang)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-secondary">
              {copy.availabilityLabel}
            </dt>
            <dd className="mt-1 font-semibold text-text-primary">
              {availabilityLabel(variants, lang)}
            </dd>
          </div>
        </dl>
        <Button asChild variant="outline" className="mt-5 w-full">
          <Link to={`/retail/products/${product.slug}`}>
            {copy.viewDetail}
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

function ProductTileSkeleton() {
  return (
    <div className="border-t-2 border-border-default pt-4" aria-hidden="true">
      <Skeleton className="aspect-[4/3] w-full rounded-panel" />
      <Skeleton className="mt-5 h-4 w-24" />
      <Skeleton className="mt-3 h-7 w-3/4" />
      <Skeleton className="mt-4 h-16 w-full" />
      <Skeleton className="mt-5 h-11 w-full" />
    </div>
  );
}

export default function RetailCatalogPage() {
  const { lang, t } = useI18n();
  const contactPath = getPublicPath("contact", lang);
  const homePath = getPublicPath("home", lang);
  const copy = {
    priceLabel: t("retail.discovery.priceLabel"),
    availabilityLabel: t("retail.discovery.availabilityLabel"),
    viewDetail: t("retail.discovery.viewDetail"),
    visual: {
      fallbackProductName: t("retail.visual.fallbackProductName"),
      visualAltPrefix: t("retail.visual.altPrefix"),
      missingVisualLabel: t("retail.visual.unavailable"),
    },
  };
  const [state, setState] = useState({
    status: HAS_CONFIGURED_BACKEND ? "loading" : "unavailable",
    items: [],
    categories: [],
    nextCursor: null,
  });
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(false);
  const loadRequestRef = useRef(null);

  const load = useCallback(() => {
    if (!HAS_CONFIGURED_BACKEND) return Promise.resolve();
    if (loadRequestRef.current) return loadRequestRef.current;

    setState((current) => ({ ...current, status: "loading" }));
    const request = Promise.all([
      publicCatalogApi.categories(),
      publicCatalogApi.products(),
    ])
      .then(([categories, page]) => {
        setState({
          status: "ready",
          categories,
          items: page.items,
          nextCursor: page.next_cursor,
        });
      })
      .catch(() => {
        setState((current) => ({ ...current, status: "error" }));
      })
      .finally(() => {
        if (loadRequestRef.current === request) {
          loadRequestRef.current = null;
        }
      });

    loadRequestRef.current = request;
    return request;
  }, []);

  useEffect(() => {
    document.title = t("retail.discovery.documentTitle");
  }, [t]);

  useEffect(() => {
    load();
  }, [load]);

  const visibleItems = useMemo(
    () =>
      selectedCategory === "all"
        ? state.items
        : state.items.filter(
            (item) => item.category.id === selectedCategory,
          ),
    [selectedCategory, state.items],
  );

  const loadMore = async () => {
    if (!state.nextCursor || loadingMore) return;
    setLoadingMore(true);
    setLoadMoreError(false);

    try {
      const page = await publicCatalogApi.products({
        cursor: state.nextCursor,
      });
      setState((current) => ({
        ...current,
        items: [...current.items, ...page.items],
        nextCursor: page.next_cursor,
      }));
    } catch {
      setLoadMoreError(true);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <MarketingLayout>
      <div className="retail-surface bg-surface-page">
        <MarketingSection
          id="custom-3d-print"
          tone="page"
          spacing="compact"
          className="scroll-mt-28 !pt-[var(--space-page-start)]"
        >
          <PageContainer>
            <div className="grid gap-8 border-b border-border-default pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="type-label text-action-primary">Niuva Retail</p>
                <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                  {t("retail.discovery.title")}
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                  {t("retail.discovery.intro")}
                </p>
              </div>
              <Button asChild variant="outline" className="w-full lg:w-auto">
                <Link to={contactPath}>
                  {t("retail.discovery.discuss")}
                </Link>
              </Button>
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection id="ready-products" tone="default" className="scroll-mt-28">
          <PageContainer>
            <div className="mb-8 max-w-3xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                {t("retail.discovery.catalogTitle")}
              </h2>
              <p className="mt-3 leading-7 text-text-secondary">
                {t("retail.discovery.catalogDescription")}
              </p>
            </div>

            {state.status === "loading" && (
              <div
                className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3"
                role="status"
                aria-label={t("retail.discovery.loading")}
              >
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <ProductTileSkeleton key={item} />
                ))}
              </div>
            )}

            {state.status === "unavailable" && (
              <div className="space-y-5">
                <OperationalState
                  state="empty"
                  title={t("retail.discovery.unavailableTitle")}
                  description={t("retail.discovery.unavailableDescription")}
                  className="rounded-panel"
                />
                <Button asChild variant="outline">
                  <Link to={homePath}>{t("retail.discovery.backToNiuva")}</Link>
                </Button>
              </div>
            )}

            {state.status === "error" && (
              <OperationalState
                state="error"
                title={t("retail.discovery.errorTitle")}
                description={t("retail.discovery.errorDescription")}
                retryLabel={t("retail.discovery.retry")}
                onRetry={load}
                className="rounded-panel"
              />
            )}

            {state.status === "ready" && state.items.length === 0 && (
              <EmptyState frame="dashed">
                {t("retail.discovery.empty")}
              </EmptyState>
            )}

            {state.status === "ready" && state.items.length > 0 && (
              <>
                <div
                  className="mb-9 flex flex-wrap gap-2"
                  role="group"
                  aria-label={t("retail.discovery.categoryFilter")}
                >
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    aria-pressed={selectedCategory === "all"}
                    onClick={() => setSelectedCategory("all")}
                  >
                    {t("retail.discovery.all")}
                  </Button>
                  {state.categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={
                        selectedCategory === category.id ? "default" : "outline"
                      }
                      aria-pressed={selectedCategory === category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>

                {visibleItems.length === 0 ? (
                  <EmptyState frame="dashed">
                    {t("retail.discovery.emptyCategory")}
                  </EmptyState>
                ) : (
                  <div
                    className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3"
                    data-testid="retail-product-grid"
                  >
                    {visibleItems.map((item) => (
                      <ProductTile
                        key={item.product.id}
                        publication={item}
                        lang={lang}
                        copy={copy}
                      />
                    ))}
                  </div>
                )}

                {state.nextCursor && selectedCategory === "all" && (
                  <div className="mt-10 border-t border-border-default pt-8 text-center">
                    {loadMoreError && (
                      <Alert
                        className="mx-auto mb-4 max-w-xl text-left"
                        data-testid="retail-load-more-error"
                      >
                        {t("retail.discovery.loadMoreError")}
                      </Alert>
                    )}
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore
                        ? t("retail.discovery.loadingMore")
                        : loadMoreError
                          ? t("retail.discovery.retryLoadMore")
                          : t("retail.discovery.loadMore")}
                    </Button>
                  </div>
                )}
              </>
            )}
          </PageContainer>
        </MarketingSection>
      </div>
    </MarketingLayout>
  );
}
