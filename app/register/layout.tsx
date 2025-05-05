import React from 'react';

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen w-full no-scrollbar overflow-y-auto">
      {/* Applying no-scrollbar and ensuring vertical scrolling is enabled if content overflows */}
      {children}
    </div>
  );
}
