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
import {
  availabilityLabel,
  formatCatalogPrice,
  publicCatalogApi,
} from "@/lib/catalog";

function ProductTile({ publication }) {
  const { product, variants, category } = publication;

  return (
    <article className="flex h-full flex-col border-t-2 border-brand-secondary pt-4">
      <RetailProductVisual product={product} />
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
            <dt className="text-xs text-text-secondary">Harga publikasi</dt>
            <dd className="mt-1 font-semibold text-text-primary">
              {formatCatalogPrice(product, variants)}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-text-secondary">Ketersediaan</dt>
            <dd className="mt-1 font-semibold text-text-primary">
              {availabilityLabel(variants)}
            </dd>
          </div>
        </dl>
        <Button asChild variant="outline" className="mt-5 w-full">
          <Link to={`/retail/products/${product.slug}`}>
            Lihat detail
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
    document.title = "Retail Discovery - Niuva";
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
          tone="page"
          spacing="compact"
          className="!pt-[var(--space-page-start)]"
        >
          <PageContainer>
            <div className="grid gap-8 border-b border-border-default pb-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="type-label text-action-primary">Niuva Retail</p>
                <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                  Produk yang dapat Anda pelajari sebelum bertransaksi.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-8 text-text-secondary sm:text-lg">
                  Bandingkan produk, harga publikasi, dan status ketersediaan.
                  Checkout, pembayaran, dan fulfilment belum diaktifkan.
                </p>
              </div>
              <Button asChild variant="outline" className="w-full lg:w-auto">
                <Link to="/contact">Diskusikan kebutuhan khusus</Link>
              </Button>
            </div>
          </PageContainer>
        </MarketingSection>

        <MarketingSection tone="default">
          <PageContainer>
            <div className="mb-8 max-w-3xl">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Katalog produk terpublikasi
              </h2>
              <p className="mt-3 leading-7 text-text-secondary">
                Informasi berasal dari publication snapshot dan status inventory
                yang aman untuk ditampilkan kepada publik.
              </p>
            </div>

            {state.status === "loading" && (
              <div
                className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3"
                role="status"
                aria-label="Memuat katalog Retail"
              >
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <ProductTileSkeleton key={item} />
                ))}
              </div>
            )}

            {state.status === "unavailable" && (
              <EmptyState frame="dashed">
                Katalog belum terhubung pada environment ini.
              </EmptyState>
            )}

            {state.status === "error" && (
              <OperationalState
                state="error"
                title="Katalog belum berhasil dimuat"
                description="Data katalog tidak diubah. Periksa koneksi Anda lalu coba lagi."
                retryLabel="Coba lagi"
                onRetry={load}
                className="rounded-panel"
              />
            )}

            {state.status === "ready" && state.items.length === 0 && (
              <EmptyState frame="dashed">
                Belum ada produk Retail yang dipublikasikan.
              </EmptyState>
            )}

            {state.status === "ready" && state.items.length > 0 && (
              <>
                <div
                  className="mb-9 flex flex-wrap gap-2"
                  role="group"
                  aria-label="Filter kategori"
                >
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    aria-pressed={selectedCategory === "all"}
                    onClick={() => setSelectedCategory("all")}
                  >
                    Semua
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
                    Tidak ada produk pada kategori ini.
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
                        Produk berikutnya belum berhasil dimuat. Produk yang
                        sudah tampil tetap tersedia.
                      </Alert>
                    )}
                    <Button
                      variant="outline"
                      onClick={loadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore
                        ? "Memuat…"
                        : loadMoreError
                          ? "Coba muat lagi"
                          : "Muat produk berikutnya"}
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
