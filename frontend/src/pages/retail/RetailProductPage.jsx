import React, { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MarketingLayout } from "@/components/layout/Layout";
import { BrandPage, MarketingSection, PageContainer } from "@/components/brand/BrandSystem";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { HAS_CONFIGURED_BACKEND } from "@/lib/api";
import {
  availabilityLabel,
  formatCatalogPrice,
  publicCatalogApi,
} from "@/lib/catalog";


export default function RetailProductPage() {
  const { slug } = useParams();
  const [state, setState] = useState({
    status: HAS_CONFIGURED_BACKEND ? "loading" : "unavailable",
    value: null,
  });

  const load = useCallback(async () => {
    if (!HAS_CONFIGURED_BACKEND) return;
    setState({ status: "loading", value: null });
    try {
      const value = await publicCatalogApi.product(slug);
      setState({ status: "ready", value });
    } catch (error) {
      setState({
        status: error.response?.status === 404 ? "not_found" : "error",
        value: null,
      });
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    document.title = state.value?.product?.name
      ? `${state.value.product.name} - Niuva Retail`
      : "Produk Retail - Niuva";
  }, [state.value]);

  return (
    <MarketingLayout>
      <BrandPage>
        <MarketingSection tone="page" className="pt-32">
          <PageContainer>
            <Link to="/retail" className="text-sm font-semibold text-action-primary">
              ← Kembali ke Retail
            </Link>
            {state.status === "loading" && (
              <div className="mt-8 grid gap-10 lg:grid-cols-2">
                <Skeleton className="aspect-[4/3] rounded-feature" />
                <div className="space-y-5">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            )}
            {state.status === "unavailable" && (
              <ErrorState
                error="Detail produk belum terhubung pada environment ini."
                onRetry={() => window.location.reload()}
              />
            )}
            {state.status === "error" && (
              <ErrorState error="Detail produk belum berhasil dimuat." onRetry={load} />
            )}
            {state.status === "not_found" && (
              <EmptyState>Produk tidak tersedia atau tidak lagi dipublikasikan.</EmptyState>
            )}
            {state.status === "ready" && state.value && (
              <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
                <div
                  className="grid aspect-[4/3] place-items-center rounded-feature bg-decoration-brand-soft p-8 text-center ring-1 ring-border-default"
                  role="img"
                  aria-label={state.value.product.media?.[0]?.alt || state.value.product.name}
                >
                  <div>
                    <p className="font-mono-tech text-xs font-semibold uppercase tracking-widest text-text-primary">
                      Niuva Retail
                    </p>
                    <p className="mt-4 font-heading text-3xl font-bold text-text-primary">
                      {state.value.product.name}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="type-label text-text-secondary">{state.value.category.name}</p>
                  <h1 className="mt-3 font-heading text-4xl font-bold text-text-primary">
                    {state.value.product.name}
                  </h1>
                  <p className="mt-5 text-base leading-8 text-text-secondary">
                    {state.value.product.description}
                  </p>
                  <div className="mt-7 border-y border-border-default py-5">
                    <p className="font-semibold text-text-primary">
                      {formatCatalogPrice(state.value.product, state.value.variants)}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary">
                      {availabilityLabel(state.value.variants)}
                    </p>
                  </div>
                  <div className="mt-7 space-y-3">
                    {state.value.cta_state === "quote_required" ? (
                      <Button asChild size="lg">
                        <Link to="/contact">Minta penawaran</Link>
                      </Button>
                    ) : (
                      <Button size="lg" disabled>
                        Transaksi Retail belum aktif
                      </Button>
                    )}
                    <p className="text-sm leading-6 text-text-secondary">
                      Checkout, pembayaran, upload, reservasi, dan fulfilment belum tersedia.
                    </p>
                  </div>
                  {state.value.variants.length > 0 && (
                    <div className="mt-9">
                      <h2 className="font-heading text-xl font-bold text-text-primary">Varian</h2>
                      <ul className="mt-4 divide-y divide-border-default border-y border-border-default">
                        {state.value.variants.map((variant) => (
                          <li key={variant.id} className="flex justify-between gap-4 py-4 text-sm">
                            <span className="font-semibold text-text-primary">{variant.name}</span>
                            <span className="text-text-secondary">
                              {availabilityLabel([variant])}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </PageContainer>
        </MarketingSection>
      </BrandPage>
    </MarketingLayout>
  );
}
