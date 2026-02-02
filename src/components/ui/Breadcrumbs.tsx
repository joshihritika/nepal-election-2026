"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { districts, provinces, getDistrictById, getProvinceById } from "@/data/districts";

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

export default function Breadcrumbs() {
  const searchParams = useSearchParams();

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: "गृहपृष्ठ", href: "/" }];

    const provinceId = searchParams.get("prov");
    const districtId = searchParams.get("dist");
    const constituencyNum = searchParams.get("const");

    if (provinceId) {
      const province = getProvinceById(provinceId);
      if (province) {
        items.push({
          label: province.name,
          href: `/?prov=${provinceId}`,
        });
      }
    }

    if (districtId) {
      const district = getDistrictById(districtId);
      if (district) {
        // Add province if not already added
        if (!provinceId) {
          const province = getProvinceById(district.provinceId);
          if (province) {
            items.push({
              label: province.name,
              href: `/?prov=${district.provinceId}`,
            });
          }
        }

        items.push({
          label: district.name,
          href: `/?dist=${districtId}`,
        });
      }
    }

    if (constituencyNum && districtId) {
      items.push({
        label: `निर्वाचन क्षेत्र ${constituencyNum}`,
        href: `/?dist=${districtId}&const=${constituencyNum}`,
        current: true,
      });
    }

    // Mark the last item as current if not already marked
    if (items.length > 0 && !items[items.length - 1].current) {
      items[items.length - 1].current = true;
    }

    return items;
  }, [searchParams]);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <ol className="flex items-center flex-wrap gap-1">
        {breadcrumbs.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}

            {item.current ? (
              <span className="font-medium text-blue-600 truncate max-w-[150px]" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-600 hover:text-gray-900 transition-colors truncate max-w-[150px]"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
