export function Footer() {
  return (
    <footer className="py-2 text-gray-600">
      <div className="flex w-full flex-wrap items-center justify-center gap-6 px-2 md:justify-between">
        <p className="font-sans text-sm font-normal leading-normal">
          © {new Date().getFullYear()} AlCambio. Sistema interno de gestión de divisas.
        </p>

        <ul className="flex items-center gap-4">
          <li>
            <span className="font-sans text-sm font-normal leading-normal">
              MVP
            </span>
          </li>
        </ul>
      </div>
    </footer>
  );
}