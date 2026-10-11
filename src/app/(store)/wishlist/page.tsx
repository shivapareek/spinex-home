import { WishlistGrid } from "./grid";

export const metadata = { title: "Wishlist", robots: { index: false } };

export default function Wishlist() {
  return (
    <section className="container min-h-[70dvh] pb-28 pt-36">
      <h1 className="font-display text-5xl tracking-tight md:text-6xl">Your wishlist</h1>
      <WishlistGrid />
    </section>
  );
}
