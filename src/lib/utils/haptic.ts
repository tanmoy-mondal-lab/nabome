export function haptic(pattern: number | number[] = 10): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Haptic feedback not supported or blocked
    }
  }
}

export function hapticLight(): void {
  haptic(5);
}

export function hapticMedium(): void {
  haptic(10);
}

export function hapticHeavy(): void {
  haptic(20);
}

export function hapticSuccess(): void {
  haptic([5, 30, 10]);
}

export function hapticError(): void {
  haptic([20, 50, 20, 50, 20]);
}
