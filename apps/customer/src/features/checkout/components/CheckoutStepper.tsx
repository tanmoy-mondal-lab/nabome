/**
 * Checkout Stepper Component
 *
 * Progress indicator for multi-step checkout flow.
 * Mobile-first, accessible, following official Component Library patterns.
 */

interface CheckoutStepperProps {
  currentStep: 'address' | 'shipping' | 'payment' | 'review';
  completedSteps: Set<string>;
  onStepClick?: (step: 'address' | 'shipping' | 'payment' | 'review') => void;
}

const steps = [
  { id: 'address', label: 'Address', icon: '📍' },
  { id: 'shipping', label: 'Shipping', icon: '🚚' },
  { id: 'payment', label: 'Payment', icon: '💳' },
  { id: 'review', label: 'Review', icon: '✓' },
] as const;

export function CheckoutStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: CheckoutStepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  return (
    <nav aria-label="Checkout progress" className="w-full">
      <ol className="flex items-center justify-between w-full" role="list">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable =
            onStepClick && (isCompleted || index === currentStepIndex + 1);

          return (
            <li key={step.id} className="flex items-center flex-1">
              <div className="flex items-center w-full">
                {/* Step Circle */}
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  aria-current={isCurrent ? 'step' : undefined}
                  aria-label={`${step.label} ${isCompleted ? 'completed' : isCurrent ? 'current' : 'upcoming'}`}
                  className={`
                    relative flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full font-semibold text-sm md:text-base transition-all duration-200
                    ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                          ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                          : 'bg-gray-200 text-gray-500'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
                    focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </button>

                {/* Step Label */}
                <div className="ml-3 md:ml-4 hidden sm:block">
                  <p
                    className={`text-sm font-medium ${
                      isCurrent
                        ? 'text-brand-600'
                        : isCompleted
                          ? 'text-green-600'
                          : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Connector Line (except for last step) */}
                {index < steps.length - 1 && (
                  <div
                    className={`
                      absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 ml-5 md:ml-6
                      ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}
                    `}
                    aria-hidden="true"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile Step Label (shown below stepper on mobile) */}
      <div className="mt-4 sm:hidden text-center">
        <p className="text-sm font-medium text-brand-600">
          {steps[currentStepIndex]?.label}
        </p>
      </div>
    </nav>
  );
}
