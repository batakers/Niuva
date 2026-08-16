import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { MarketingLayout } from "@/components/layout/Layout";
import {
  MarketingSection,
  PageContainer,
} from "@/components/brand/BrandSystem";
import { RetailProductVisual } from "@/components/retail/RetailProductVisual";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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

function RetailCtaState({ state, contactPath, lang }) {
  if (state === "quote_required") {
    return (
      <div className="border-l-2 border-action-primary pl-5">
        <h2 className="font-heading text-lg font-semibold text-text-primary">
          Produk ini memerlukan penawaran
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-text-secondary">
          Harga final dan komitmen pengerjaan ditetapkan setelah kebutuhan
          ditinjau. Permintaan ini tidak langsung membuat pesanan atau pembayaran.
        </p>
        <Button asChild className="mt-5 w-full sm:w-auto">
          <Link to={contactPath}>{lang === "en" ? "Request a quote" : "Minta penawaran"}</Link>
        </Button>
      </div>
    );
  }

  if (state === "discovery_only") {
    return (
      <Alert tone="default" role="status" className="px-4 py-4">
        <p className="font-semibold text-text-primary">
          Transaksi Retail belum aktif
        </p>
        <p className="mt-1 leading-6 text-text-secondary">
          Produk dapat dipelajari, tetapi checkout, pembayaran, upload,
          reservasi, dan fulfilment belum tersedia.
        </p>
      </Alert>
    );
  }

  return (
    <Alert tone="warning" role="status" className="px-4 py-4">
      <p className="font-semibold text-text-primary">
        Permintaan Retail belum tersedia
      </p>
      <p className="mt-1 leading-6 text-text-secondary">
        Produk ini tetap dapat dilihat, tetapi tidak sedang menerima tindakan
        Retail dari halaman ini.
      </p>
    </Alert>
  );
}

export default function RetailProductPage() {
  const { lang } = useI18n();
  const contactPath = getPublicPath("contact", lang);
  const { slug } = useParams();
  const [state, setState] = useState({
    status: HAS_CONFIGURED_BACKEND ? "loading" : "unavailable",
    value: null,
  });
  const loadRequestRef = useRef(null);
  const latestSlugRef = useRef(slug);
  latestSlugRef.current = slug;

  const load = useCallback(() => {
    if (!HAS_CONFIGURED_BACKEND) return Promise.resolve();
    const requestSlug = slug;
    const activeRequest = loadRequestRef.current;
    if (activeRequest?.slug === requestSlug) return activeRequest.promise;

    setState({ status: "loading", value: null });
    const request = publicCatalogApi
      .product(slug)
      .then((value) => {
        if (latestSlugRef.current === requestSlug) {
          setState({ status: "ready", value });
        }
      })
      .catch((error) => {
        if (latestSlugRef.current === requestSlug) {
          setState({
            status: error.response?.status === 404 ? "not_found" : "error",
            value: null,
          });
        }
      })
      .finally(() => {
        const currentRequest = loadRequestRef.current;
        if (
          latestSlugRef.current === requestSlug &&
          currentRequest?.slug === requestSlug &&
          currentRequest.promise === request
        ) {
          loadRequestRef.current = null;
        }
      });

    loadRequestRef.current = { slug: requestSlug, promise: request };
    return request;
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
      <div className="retail-surface bg-surface-page">
        <MarketingSection
          tone="page"
          spacing="compact"
          className="!pt-[var(--space-page-start)]"
        >
          <PageContainer>
            <Button asChild variant="ghost" className="-ml-3">
              <Link to="/retail">
                <span aria-hidden="true">←</span>
                Kembali ke Retail
              </Link>
            </Button>

            {state.status === "loading" && (
              <div
                className="mt-8 grid gap-10 lg:grid-cols-2"
                role="status"
                aria-label="Memuat detail produk"
              >
                <Skeleton className="aspect-[4/3] rounded-panel" />
                <div className="space-y-5">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            )}

            {state.status === "unavailable" && (
              <OperationalState
                state="empty"
                title="Detail produk belum terhubung"
                description="Environment ini belum memiliki koneksi ke katalog publik."
                className="mt-8 rounded-panel"
              />
            )}

            {state.status === "error" && (
              <OperationalState
                state="error"
                title="Detail produk belum berhasil dimuat"
                description="Periksa koneksi Anda lalu coba memuat produk kembali."
                retryLabel="Coba lagi"
                onRetry={load}
                className="mt-8 rounded-panel"
              />
            )}

            {state.status === "not_found" && (
              <OperationalState
                state="empty"
                title="Produk tidak tersedia"
                description="Produk ini tidak ditemukan atau tidak lagi dipublikasikan."
                className="mt-8 rounded-panel"
              />
            )}

            {state.status === "ready" && state.value && (
              <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start">
                <RetailProductVisual
                  product={state.value.product}
                  eager
                  className="lg:sticky lg:top-28"
                />

                <div>
                  <p className="type-label text-action-primary">
                    {state.value.category.name}
                  </p>
                  <h1 className="mt-3 font-heading text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                    {state.value.product.name}
                  </h1>
                  <p className="mt-5 text-base leading-8 text-text-secondary">
                    {state.value.product.description}
                  </p>

                  <dl className="mt-7 divide-y divide-border-default border-y border-border-default">
                    <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <dt className="text-sm text-text-secondary">
                        Harga publikasi
                      </dt>
                      <dd className="font-semibold text-text-primary">
                        {formatCatalogPrice(
                          state.value.product,
                          state.value.variants,
                        )}
                      </dd>
                    </div>
                    <div className="grid gap-2 py-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
                      <dt className="text-sm text-text-secondary">
                        Ketersediaan
                      </dt>
                      <dd className="font-semibold text-text-primary">
                        {availabilityLabel(state.value.variants)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-7">
                    <RetailCtaState
                      state={state.value.cta_state}
                      contactPath={contactPath}
                      lang={lang}
                    />
                  </div>

                  {state.value.variants.length > 0 && (
                    <section className="mt-10" aria-labelledby="retail-variants-title">
                      <h2
                        id="retail-variants-title"
                        className="font-heading text-xl font-bold text-text-primary"
                      >
                        Varian terpublikasi
                      </h2>
                      <ul className="mt-4 divide-y divide-border-default border-y border-border-default">
                        {state.value.variants.map((variant) => (
                          <li
                            key={variant.id}
                            className="flex flex-col gap-1 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                          >
                            <span className="font-semibold text-text-primary">
                              {variant.name}
                            </span>
                            <span className="text-text-secondary">
                              {availabilityLabel([variant])}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              </div>
            )}
          </PageContainer>
        </MarketingSection>
      </div>
    </MarketingLayout>
  );
}
