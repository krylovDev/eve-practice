"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const themes = [
  { value: "light", label: "Светлая", icon: SunIcon },
  { value: "system", label: "Системная", icon: MonitorIcon },
  { value: "dark", label: "Тёмная", icon: MoonIcon },
] as const;

type ThemeValue = (typeof themes)[number]["value"];

const toggleClassName =
  "inline-flex items-center gap-0.5 rounded-lg border border-border bg-background/80 p-0.5 shadow-sm backdrop-blur-sm";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div aria-hidden className={cn(toggleClassName, className)}>
        {themes.map(({ value, icon: Icon }) => (
          <div
            key={value}
            className="flex size-7 items-center justify-center rounded-[min(var(--radius-md),12px)] text-muted-foreground"
          >
            <Icon className="size-3.5" />
          </div>
        ))}
      </div>
    );
  }

  const active: ThemeValue =
    theme === "light" || theme === "dark" || theme === "system"
      ? theme
      : "system";

  return (
    <div
      aria-label="Тема оформления"
      className={cn(toggleClassName, className)}
      role="radiogroup"
    >
      {themes.map(({ value, label, icon: Icon }) => {
        const isActive = active === value;

        return (
          <Button
            key={value}
            aria-checked={isActive}
            aria-label={label}
            onClick={() => setTheme(value)}
            role="radio"
            size="icon-sm"
            title={label}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
          >
            <Icon />
          </Button>
        );
      })}
    </div>
  );
}
