import AppLayout from "@/components/layout/AppLayout";

export default function PublicLibraryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
