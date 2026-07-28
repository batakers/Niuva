import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/Layout";
import {
  BrandPage,
  MarketingSection,
  PageContainer,
  PageHero,
  SectionHeader,
} from "@/components/brand/BrandSystem";
import { BrandButton } from "@/components/brand/CompanyProfileBlocks";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { HAS_CONFIGURED_BACKEND, resolveMediaUrl } from "@/lib/api";
import {
  availabilityLabel,
  formatCatalogPrice,
  publicCatalogApi,
} from "@/lib/catalog";


function ProductVisual({ product }) {
  const image = resolveMediaUrl(product.media?.[0]?.storage_path);
  return (
    <div
      className="grid aspect-[4/3] place-items-center rounded-card bg-decoration-brand-soft p-6 text-center ring-1 ring-border-default"
      role={image ? undefined : "img"}
      aria-label={image ? undefined : (product.media?.[0]?.alt || `Visual ${product.name}`)}
    >
      {image ? (
        <img
          src={image}
          alt={product.media?.[0]?.alt || `Visual ${product.name}`}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : <div>
        <span className="font-mono-tech text-xs font-semibold uppercase tracking-widest text-text-primary">
          Niuva Retail
        </span>
        <p className="mt-3 font-heading text-xl font-bold text-text-primary">{product.name}</p>
      </div>}
    </div>
  );
}

function ProductCard({ publication }) {
  const { product, variants, category } = publication;
  return (
    <article className="flex h-full flex-col rounded-feature border border-border-default bg-surface-default p-4 shadow-surface">
      <ProductVisual product={product} />
      <div className="flex flex-1 flex-col px-1 pb-1 pt-5">
        <p className="type-label text-text-secondary">{category.name}</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-text-primary">{product.name}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">
          {product.short_description}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border-default pt-4">
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {formatCatalogPrice(product, variants)}
            </p>
            <p className="mt-1 text-xs text-text-secondary">{availabilityLabel(variants)}</p>
          </div>
          <Link
            to={`/retail/products/${product.slug}`}
            className="inline-flex min-h-11 items-center rounded-control bg-action-primary px-4 py-2 text-sm font-semibold text-text-inverse hover:bg-action-primary-hover"
          >
            Lihat detail
          </Link>
        </div>
      </div>
    </article>
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

  const load = useCallback(async () => {
    if (!HAS_CONFIGURED_BACKEND) return;
    setState((current) => ({ ...current, status: "loading" }));
    try {
      const [categories, page] = await Promise.all([
        publicCatalogApi.categories(),
        publicCatalogApi.products(),
      ]);
      setState({
        status: "ready",
        categories,
        items: page.items,
        nextCursor: page.next_cursor,
      });
    } catch (error) {
      setState((current) => ({ ...current, status: "error" }));
    }
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
    try {
      const page = await publicCatalogApi.products({
        cursor: state.nextCursor,
      });
      setState((current) => ({
        ...current,
        items: [...current.items, ...page.items],
        nextCursor: page.next_cursor,
      }));
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <MarketingLayout>
      <BrandPage>
        <PageHero
          label="Retail discovery"
          title="Jelajahi produk Niuva tanpa alur transaksi."
          body="Retail adalah jalur sekunder untuk melihat produk yang sudah dipublikasikan. Checkout, pembayaran, dan fulfilment belum diaktifkan."
          primaryAction={<BrandButton to="/contact">Diskusikan kebutuhan</BrandButton>}
          variant="compact"
        />
        <MarketingSection tone="default">
          <PageContainer>
            <SectionHeader
              title="Katalog produk terpublikasi"
              body="Harga dan ketersediaan ditampilkan secara aman dari publication snapshot dan status inventory."
              align="stacked"
            />
            {state.status === "loading" && (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" role="status">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Skeleton key={item} className="h-[28rem] rounded-feature" />
                ))}
              </div>
            )}
            {state.status === "unavailable" && (
              <ErrorState
                error="Katalog belum terhubung pada environment ini."
                onRetry={() => window.location.reload()}
              />
            )}
            {state.status === "error" && (
              <ErrorState error="Katalog belum berhasil dimuat." onRetry={load} />
            )}
            {state.status === "ready" && state.items.length === 0 && (
              <EmptyState>Belum ada produk Retail yang dipublikasikan.</EmptyState>
            )}
            {state.status === "ready" && state.items.length > 0 && (
              <>
                <div className="mb-7 flex flex-wrap gap-2" aria-label="Filter kategori">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    onClick={() => setSelectedCategory("all")}
                  >
                    Semua
                  </Button>
                  {state.categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
                {visibleItems.length === 0 ? (
                  <EmptyState>Tidak ada produk pada kategori ini.</EmptyState>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {visibleItems.map((item) => (
                      <ProductCard key={item.product.id} publication={item} />
                    ))}
                  </div>
                )}
                {state.nextCursor && selectedCategory === "all" && (
                  <div className="mt-10 text-center">
                    <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore ? "Memuat…" : "Muat produk berikutnya"}
                    </Button>
                  </div>
                )}
              </>
            )}
          </PageContainer>
        </MarketingSection>
      </BrandPage>
    </MarketingLayout>
  );
}
