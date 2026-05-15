import { Heading } from "@/components/ui/heading";
import { requireUser, getCurrentProfile } from "@/lib/auth";
import { ProfileForm } from "@/components/account/ProfileForm";

export const metadata = { title: "개인정보" };

export default async function AccountProfilePage() {
  const user = await requireUser({ next: "/account/profile" });
  const profile = await getCurrentProfile();

  return (
    <section className="space-y-6">
      <div>
        <Heading variant="h2" className="!text-2xl">
          개인정보
        </Heading>
        <p className="mt-2 text-sm text-muted-foreground">
          이름과 연락처를 관리할 수 있습니다.
        </p>
      </div>

      <ProfileForm
        email={user.email ?? ""}
        defaultValues={{
          display_name: profile?.display_name ?? "",
          phone: profile?.phone ?? "",
        }}
      />
    </section>
  );
}
