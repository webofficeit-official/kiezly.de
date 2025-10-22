"use client";

import React from "react";
import {
  ShieldCheck,
  MapPin,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useCollections } from "@/lib/react-query/queries/user/account";
import { getIconForCategory } from "@/components/ui/icon-category";
import { useAuth } from "@/lib/context/auth-context";
import { useLocalizedRouter } from "@/lib/useLocalizedRouter";
import { useT } from "../layout";
import { getIcon } from "../how-it-works/page";

export default function Page() {
  const collections = useCollections();
  const [what, setWhat] = React.useState("");
  const [where, setWhere] = React.useState("");
  const [categories, setCategories] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const router = useRouter();

  const { user } = useAuth();
  const { push } = useLocalizedRouter();
  const t = useT("home");
  const howItWorks = t("how-it-works.steps") || [];
  const trustSafety = t("trust-safety.steps") || [];

  const doSearch = () => {
    push(
      `/jobs?q=${encodeURIComponent(what)}&city=${encodeURIComponent(where)}`
    );
  };

  const doCategory = (slug) => {
    push(`/jobs?category=${encodeURIComponent(slug)}`);
  };

  React.useEffect(() => {
    setIsLoading(true);
    collections.mutate(
      {},
      {
        onSuccess: (data) => {
          setCategories(data.data.jobCategories);
          setIsLoading(false);
        },
        onError: (err: any) => {
          setIsLoading(false);
        },
      }
    );
  }, []);

  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-12">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              {t("heading")}{" "}
              <span className="underline decoration-neutral-300">
                {t("heading-underline")}
              </span>
            </h1>
            <p className="mt-3 text-neutral-600 md:text-lg">{t("subheader")}</p>

            <Card className="mt-6 shadow-sm">
              <CardContent className="p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Label className="mb-1">{t("form.keyword.label")}</Label>
                    <div className="relative">
                      <Input
                        placeholder={t("form.keyword.placeholder")}
                        value={what}
                        onChange={(e) => setWhat(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && doSearch()}
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="mb-1">{t("form.location.label")}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                      <Input
                        className="pl-9"
                        placeholder={t("form.location.placeholder")}
                        value={where}
                        onChange={(e) => setWhere(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && doSearch()}
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button className="w-full" onClick={doSearch}>
                      <Search className="mr-2 h-4 w-4" /> {t("form.button")}
                    </Button>
                  </div>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  {t("form.description")}
                </p>
              </CardContent>
            </Card>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-neutral-600">
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />{" "}
                {t("form.badge.id-verified")}
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> {t("form.badge.first-aid")}
              </span>
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />{" "}
                {t("form.badge.police-certificate")}
              </span>
            </div>
          </div>

          <div className="">
            <Card className="rounded-3xl border-neutral-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-neutral-700">
                  {t("popular")}
                </CardTitle>
              </CardHeader>
              <CardContent
                className="grid grid-cols-2 gap-3 p-4 md:grid-cols-3 overflow-auto"
                style={{ height: "320px" }}
              >
                {isLoading
                  ? Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="rounded-2xl border p-3 hover:shadow-sm"
                      >
                        {/* Icon + name row */}
                        <div className="mb-1 flex items-center gap-2">
                          <div className="h-2 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />

                          <div className="h-2 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                        </div>
                        <div className="h-2 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                      </div>
                    ))
                  : categories.map(({ id, name, slug }) => (
                      <div
                        key={id}
                        className="rounded-2xl border p-3 hover:shadow-sm"
                        onClick={() => doCategory(slug)}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          {getIconForCategory(name)}
                          <span className="text-sm font-medium">{name}</span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          {t("popular-rate")}
                        </div>
                      </div>
                    ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Teaser that links to the dedicated page */}
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">{t("how-it-works.title")}</h2>
          <p className="text-neutral-600">{t("how-it-works.description")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.isArray(howItWorks) && howItWorks.map((step: any, i: number) => {
            const IconComponent = getIcon(step.icon);

            return (
              <Card key={i} className="h-full">
                <CardContent className="p-5">
                  <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                    <IconComponent className="h-4 w-4" />{" "}
                    {/* ✅ dynamic icon */}
                  </div>
                  <h3 className="font-medium">
                    {i + 1}) {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <div className="mt-6">
          <button
            onClick={() => push("/how-it-works")}
            className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90"
          >
            {t("how-it-works.button")} <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </section>

      <section id="categories" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">{t("categories.title")}</h2>
          <p className="text-neutral-600">{t("categories.description")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => (
                <Card key={i} className="group hover:shadow-sm">
                  <CardContent className="p-5">
                    {/* Icon + name row */}
                    <div className="mb-2 flex items-center gap-2 h-4">
                      <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />

                      <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                    </div>
                    <div className="h-4 w-24 rounded bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]" />
                  </CardContent>
                </Card>
              ))
            : categories.map(({ id, name, slug }) => (
                <Card key={id} className="group hover:shadow-sm">
                  <CardContent className="p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl border bg-white">
                        {getIconForCategory(name)}
                      </div>
                      <h3 className="font-medium">{name}</h3>
                    </div>
                    <p className="text-sm text-neutral-600">
                      {t("categories.subtitle")}
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() =>
                          push(`/post-job/basic-details?category=${slug}`)
                        }
                        className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2
                      transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                      >
                        {t("categories.post-job", { name: name })}
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      <section id="trust" className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">{t("trust-safety.title")}</h2>
          <p className="text-neutral-600">{t("trust-safety.description")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {Array.isArray(trustSafety)&&trustSafety.map((step: any, i: number) => {
            const IconComponent = getIcon(step.icon);

            return (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-white">
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="mt-1 text-sm text-neutral-600">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {!user && (
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
          <Card className="border-neutral-200 bg-gradient-to-br from-neutral-50 to-white">
            <CardContent className="flex flex-col items-start gap-3 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold">{t("help.title")}</h3>
                <p className="text-neutral-600">{t("help.description")}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => push("/signup?role=client")}
                  className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-neutral-900 text-white border-neutral-900 hover:opacity-90"
                >
                  {t("help.mini‑job")}
                </button>
                <button
                  onClick={() => push("/signup?role=helper")}
                  className="inline-flex items-center justify-center rounded-2xl text-sm font-medium px-3 py-2 transition-colors border bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-50"
                >
                  {t("help.helper")}
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
