import { Heading } from "@/components/ui/heading";
import { requireUser } from "@/lib/auth";
import { PasswordChangeForm } from "@/components/account/PasswordChangeForm";

export const metadata = { title: "비밀번호 변경" };

export default async function AccountPasswordPage() {
  const user = await requireUser({ next: "/account/password" });

  const identities = user.identities ?? [];
  const hasEmailProvider = identities.some((i) => i.provider === "email");

  // 소셜 가입자는 폼 대신 안내 메시지
  if (!hasEmailProvider) {
    const providers = identities
      .map((i) => i.provider)
      .filter(Boolean)
      .join(", ");
    return (
      <section className="space-y-6 max-w-lg">
        <Heading variant="h2" className="!text-2xl">
          비밀번호 변경
        </Heading>
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-medium">소셜 계정으로 가입하셨습니다</p>
          <p className="mt-2 text-sm text-muted-foreground">
            비밀번호는 {providers || "해당"} 플랫폼에서 변경해주세요.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <Heading variant="h2" className="!text-2xl">
          비밀번호 변경
        </Heading>
        <p className="mt-2 text-sm text-muted-foreground">
          8자 이상, 안전한 비밀번호를 사용하세요.
        </p>
      </div>
      <PasswordChangeForm />
    </section>
  );
}
