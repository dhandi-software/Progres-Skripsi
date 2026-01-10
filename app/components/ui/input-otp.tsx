import { useContext } from "react";
import { OTPInput, OTPInputContext, REGEXP_ONLY_DIGITS } from "input-otp";

import { cn } from "~/lib/utils";

type InputOTPProps = Partial<React.ComponentProps<typeof OTPInput>> & {
    containerClassName?: string;
};

function InputOTP({
    className,
    containerClassName,
    onComplete,
    onChange,
    disabled,
}: InputOTPProps) {
    return (
        <OTPInput
            inputMode="numeric"
            data-slot="input-otp"
            containerClassName={cn(
                "flex items-center gap-x-md has-disabled:opacity-50",
                containerClassName
            )}
            className={cn("disabled:cursor-not-allowed")}
            maxLength={6}
            onComplete={onComplete}
            onChange={onChange}
            disabled={disabled}
            pattern={REGEXP_ONLY_DIGITS}
        >
            {Array.from({ length: 6 }).map((_, i) => (
                <InputOTPSlot
                    key={i}
                    index={i}
                    className={className}
                    aria-placeholder="0"
                />
            ))}
        </OTPInput>
    );
}

function InputOTPSlot({
    index,
    className,
    ...props
}: React.ComponentProps<"div"> & {
    index: number;
}) {
    const inputOTPContext = useContext(OTPInputContext);
    const { char, hasFakeCaret, isActive } =
        inputOTPContext?.slots[index] ?? {};

    return (
        <div
            data-slot="input-otp-slot"
            data-active={isActive}
            className={cn(
                // base styles
                "text-foreground rounded-[0.375rem] relative flex h-[2.5rem] w-[2.5rem] items-center justify-center text-xl font-geist-mono transition-all outline-none border border-[#E3E3E3]",
                "dark:bg-input/30",
                // state styles
                "data-[active=true]:z-10 data-[active=true]:border-ring data-[active=true]:ring-[3px] data-[active=true]:ring-ring/50",
                "aria-invalid:border-destructive",
                "data-[active=true]:aria-invalid:border-destructive data-[active=true]:aria-invalid:ring-destructive/20 dark:data-[active=true]:aria-invalid:ring-destructive/40",

                className
            )}
            {...props}
        >
            {char ?? (
                <span className="text-muted-foreground select-none opacity-50">
                    0
                </span>
            )}
            {hasFakeCaret && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="animate-caret-blink bg-foreground h-4 w-px duration-1000" />
                </div>
            )}
        </div>
    );
}

export { InputOTP };
