import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Send Feedback | Feedback Hub",
  description: "Send anonymous feedback to users",
};

export default function MessageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {children}
    </div>
  );
} 