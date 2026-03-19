export const DEMO_LANGUAGE = "typescript";

export const DEMO_CODE = `// utils/cart.ts
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function applyDiscount(total: number, discountPct: number): number {
  if (discountPct < 0 || discountPct > 100) {
    throw new Error("Discount must be between 0 and 100");
  }
  return total * (1 - discountPct / 100);
}

export function removeItem(items: CartItem[], id: string): CartItem[] {
  return items.filter((item) => item.id !== id);
}`;

export const DEMO_TESTS = `// utils/cart.test.ts
import { calculateTotal, applyDiscount, removeItem, CartItem } from "./cart";

const mockItems: CartItem[] = [
  { id: "1", name: "Widget", price: 9.99, quantity: 2 },
  { id: "2", name: "Gadget", price: 24.99, quantity: 1 },
];

describe("calculateTotal", () => {
  it("sums price * quantity for all items", () => {
    expect(calculateTotal(mockItems)).toBeCloseTo(44.97);
  });

  it("returns 0 for an empty cart", () => {
    expect(calculateTotal([])).toBe(0);
  });

  it("handles a single item with quantity > 1", () => {
    const items: CartItem[] = [{ id: "x", name: "X", price: 5, quantity: 3 }];
    expect(calculateTotal(items)).toBe(15);
  });
});

describe("applyDiscount", () => {
  it("applies a 10% discount correctly", () => {
    expect(applyDiscount(100, 10)).toBeCloseTo(90);
  });

  it("applies a 0% discount (no change)", () => {
    expect(applyDiscount(50, 0)).toBe(50);
  });

  it("applies a 100% discount (free)", () => {
    expect(applyDiscount(50, 100)).toBe(0);
  });

  it("throws for a negative discount", () => {
    expect(() => applyDiscount(50, -5)).toThrow("Discount must be between 0 and 100");
  });

  it("throws when discount exceeds 100", () => {
    expect(() => applyDiscount(50, 110)).toThrow("Discount must be between 0 and 100");
  });
});

describe("removeItem", () => {
  it("removes the item with the matching id", () => {
    const result = removeItem(mockItems, "1");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("2");
  });

  it("returns unchanged array if id is not found", () => {
    const result = removeItem(mockItems, "999");
    expect(result).toHaveLength(2);
  });

  it("returns empty array when removing the only item", () => {
    const single: CartItem[] = [{ id: "a", name: "A", price: 1, quantity: 1 }];
    expect(removeItem(single, "a")).toEqual([]);
  });
});`;
