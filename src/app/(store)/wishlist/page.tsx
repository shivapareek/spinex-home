import { WishlistGrid } from "./grid";

export const metadata = { title: "Wishlist", robots: { index: false } };

export default function Wishlist() {
  return (
    <section className="container min-h-[70dvh] py-10 md:py-14">
      <h1 className="text-3xl font-semibold md:text-4xl">Your wishlist</h1>
      <p className="mt-2 text-[15px] text-muted">Idols you have saved for later.</p>
      <WishlistGrid />
    </section>
  );
}
