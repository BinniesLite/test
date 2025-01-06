export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log("Hello world");
  console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
  console.log(process.env.CLERK_SECRET_KEY);
  
  return (
    <html lang="en">
      <body>
        Hello world
        {children}
      </body>
    </html>
  );
}