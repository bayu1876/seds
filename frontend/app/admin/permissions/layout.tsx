import AppLayout from "@/components/layout/AppLayout";

export default function PermissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
