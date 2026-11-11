import AppLayout from "@/components/layout/AppLayout";

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
