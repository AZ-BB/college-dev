import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-4 border-t border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 py-6 md:flex-row md:justify-between">

          {/* Center: Logo + Links */}
          <ul className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 mx-auto">
            <li>
              <Link href="/" className="flex items-center">
                <Image
                  src="/logo.svg"
                  alt="College Logo"
                  width={90}
                  height={90}
                  className="h-6 w-auto"
                />
              </Link>
            </li>

            <li><Link href="/collegers">Collegers</Link></li>
            <li><Link href="/communities">Communities</Link></li>
            <li><Link href="/learn">Learn</Link></li>
            <li><Link href="/use-cases">Use Cases</Link></li>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><p className="text-sm text-gray-500">
              © {currentYear}
            </p></li>
          </ul>

          

        </div>
      </div>
    </footer>
  );
}
