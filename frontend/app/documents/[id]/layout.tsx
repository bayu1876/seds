import AppLayout from "@/components/layout/AppLayout";

export default function DocumentDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
