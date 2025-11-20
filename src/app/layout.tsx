import "./globals.css";

export const metadata = {
    title: "Talk to Jesus",
    description: "Divine conversation with Jesus",
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className="page-transition">{children}</body>
        </html>
    );
}
