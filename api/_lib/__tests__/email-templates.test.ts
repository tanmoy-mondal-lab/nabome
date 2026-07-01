import { describe, expect, it } from "vitest";
import { getEmailTemplate } from "../email-templates";

describe("email templates", () => {
  it("renders generic notification emails", () => {
    const template = getEmailTemplate("notification", {
      email: "customer@example.com",
      firstName: "Asha",
      title: "Order Updated",
      body: "Your order has a new status update.",
      link: "/account/orders/order-1",
    });

    expect(template).not.toBeNull();
    expect(template?.subject).toBe("Order Updated");
    expect(template?.preview).toContain("new status update");
    expect(template?.html).toContain("Asha");
    expect(template?.html).toContain("View Details");
  });
});
