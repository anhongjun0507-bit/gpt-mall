import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { Heading } from "@/components/ui/heading";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "신규 상품 등록" };

export default function AdminProductsNewPage() {
  return (
    <>
      <div>
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-accent-gold transition-gold"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          상품 목록으로
        </Link>
        <Heading variant="h2" className="!text-2xl mt-3">
          신규 상품 등록
        </Heading>
      </div>
      <div className="mt-8">
        <ProductForm mode="create" />
      </div>
    </>
  );
}
