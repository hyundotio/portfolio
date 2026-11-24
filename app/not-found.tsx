import Link from "next/link";

export default function NotFound() {
  return (
    <header className="page-head grid">
      <h1 className="display col-display">Page not found</h1>
      <p className="col-display">
        <Link href="/">Go to the home page</Link>
      </p>
    </header>
  );
}
