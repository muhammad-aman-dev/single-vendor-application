import Link from "next/link";

export default function ProductNotFound() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-neutral-950 px-4 text-white">
      <div className="w-full max-w-xl text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-neutral-800 bg-neutral-900">
          <span className="text-xl text-neutral-500">
            R
          </span>
        </div>

        <p className="mt-6 text-xs font-medium uppercase tracking-[0.3em] text-neutral-600">
          Rebel Watches
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          Watch not found
        </h1>

        <p className="mx-auto mt-5 max-w-md leading-7 text-neutral-500">
          The watch you are looking for may have been
          removed, is no longer available, or the link
          may be incorrect.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            href="/products"
            className="rounded-xl bg-white px-7 py-3.5 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            Browse Watches
          </Link>

          <Link
            href="/"
            className="rounded-xl border border-neutral-800 px-7 py-3.5 text-sm font-semibold text-neutral-300 transition hover:border-neutral-700 hover:bg-neutral-900 hover:text-white"
          >
            Back Home
          </Link>

        </div>
      </div>
    </main>
  );
}