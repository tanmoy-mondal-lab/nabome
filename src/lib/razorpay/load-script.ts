export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not defined"));
      return;
    }
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load Razorpay Checkout SDK");
      }
      reject(new Error("Failed to load Razorpay Checkout SDK"));
    };
    document.head.appendChild(script);
  });
}
