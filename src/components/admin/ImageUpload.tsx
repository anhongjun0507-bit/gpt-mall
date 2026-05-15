"use client";

import * as React from "react";
import { Upload, X, ImagePlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"] as const;

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
}

// 상품 이미지 업로드 — 드래그앤드롭 + 클릭. Supabase Storage 'products' 버킷에 직접 업로드.
// admin 만 사용 가능 (RLS 가드).
export function ImageUpload({ value, onChange, disabled }: Props) {
  const [uploading, setUploading] = React.useState(false);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!ALLOWED.includes(file.type as (typeof ALLOWED)[number])) {
      toast({
        title: "지원하지 않는 형식",
        description: "JPG / PNG / WEBP 만 업로드할 수 있습니다.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_SIZE) {
      toast({
        title: "파일이 너무 큽니다",
        description: `최대 ${(MAX_SIZE / 1024 / 1024).toFixed(0)}MB 까지 업로드 가능합니다.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() ?? "bin";
      // 충돌 방지: timestamp + 랜덤
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error } = await supabase.storage
        .from("products")
        .upload(path, file, { cacheControl: "31536000", upsert: false });
      if (error) throw error;

      const { data } = supabase.storage.from("products").getPublicUrl(path);
      onChange(data.publicUrl);
      toast({ title: "이미지를 업로드했어요" });
    } catch (e) {
      console.error("[ImageUpload] 업로드 실패", e);
      toast({
        title: "업로드 실패",
        description: "잠시 후 다시 시도하거나 관리자에게 문의하세요.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    void uploadFile(files[0]);
  }

  if (value) {
    return (
      <div className="relative aspect-square w-full max-w-sm rounded-2xl overflow-hidden border border-border bg-secondary group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={value}
          alt="상품 이미지 미리보기"
          className="w-full h-full object-cover"
        />
        {!disabled && (
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="이미지 제거"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/80 text-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) handleFiles(e.dataTransfer.files);
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={cn(
        "aspect-square w-full max-w-sm rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200",
        dragOver
          ? "border-accent-gold bg-accent-gold/5"
          : "border-border hover:border-foreground/40 bg-secondary/30",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 flex items-center justify-center">
        {uploading ? (
          <Upload className="w-5 h-5 text-accent-gold animate-pulse" />
        ) : (
          <ImagePlus className="w-5 h-5 text-accent-gold" />
        )}
      </div>
      <p className="text-sm font-medium text-foreground">
        {uploading ? "업로드 중..." : "이미지 업로드"}
      </p>
      <p className="text-xs text-muted-foreground text-center px-4">
        클릭 또는 드래그앤드롭
        <br />
        JPG · PNG · WEBP / 최대 5MB
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        className="sr-only"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = ""; // 같은 파일 다시 선택 가능하게
        }}
        disabled={disabled}
      />
    </div>
  );
}
