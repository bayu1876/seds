import AppLayout from "@/components/layout/AppLayout";

export default function DepartmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
