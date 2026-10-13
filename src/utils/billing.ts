import type { CartItem } from '../context/OrderContext';
import type { ExtraCharge, Offer } from '../services/adminRepo';

/** Everything the billing engine needs to price a cart. */
export interface BillConfig {
  /** GST percentage, e.g. 5 means 5%. */
  gstPercent: number;
  offers: Offer[];
  extraCharges: ExtraCharge[];
}

export interface Bill {
  subtotal: number;
  /** Rupees removed by the best qualifying offer (0 when none apply). */
  discount: number;
  /** Title of the applied offer, or null. */
  offerTitle: string | null;
  /** Sum of active extra charges (packing, service, etc.). */
  charges: number;
  /** GST computed on the post-discount base. */
  tax: number;
  /** Final amount payable = subtotal - discount + charges + tax. */
  total: number;
}

export function subtotalOf(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** Rupees an offer removes from a subtotal (capped at the subtotal). */
export function discountOf(offer: Offer, subtotal: number): number {
  const raw = offer.kind === 'percent' ? (subtotal * offer.value) / 100 : offer.value;
  return Math.min(Math.round(raw), subtotal);
}

/** The active offer with the subtotal's minimum met that gives the biggest discount. */
export function bestOfferFor(offers: Offer[], subtotal: number): Offer | null {
  const eligible = offers.filter((offer) => offer.active && subtotal >= offer.minOrder);
  if (eligible.length === 0) return null;
  return eligible.reduce((best, offer) =>
    discountOf(offer, subtotal) > discountOf(best, subtotal) ? offer : best
  );
}

/** Total of active extra charges. Percent charges apply to the given base. */
export function chargesAmount(extraCharges: ExtraCharge[], base: number): number {
  return extraCharges
    .filter((charge) => charge.active)
    .reduce(
      (sum, charge) =>
        sum + (charge.kind === 'percent' ? Math.round((base * charge.value) / 100) : charge.value),
      0
    );
}

/** Price a cart with the owner's configured GST, offers and extra charges. */
export function computeBill(items: CartItem[], config: BillConfig): Bill {
  const subtotal = subtotalOf(items);
  const offer = bestOfferFor(config.offers, subtotal);
  const discount = offer ? discountOf(offer, subtotal) : 0;
  const taxableBase = Math.max(0, subtotal - discount);
  const charges = chargesAmount(config.extraCharges, taxableBase);
  const tax = Math.round((taxableBase * config.gstPercent) / 100);
  const total = taxableBase + charges + tax;
  return { subtotal, discount, offerTitle: offer ? offer.title : null, charges, tax, total };
}
