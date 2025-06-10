"use client";

import * as React from "react";

import { cn } from "@/libs/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ChartConfig = Record<
  string,
  {
    label: string;
    color: string;
  }
>;

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
}

const ChartContext = React.createContext<{
  config: ChartConfig;
  activeKey?: string;
  setActiveKey: (key?: string) => void;
}>({
  config: {},
  setActiveKey: () => {},
});

function ChartContainer({
  config,
  children,
  className,
  ...props
}: ChartContainerProps) {
  const [activeKey, setActiveKey] = React.useState<string | undefined>(
    undefined,
  );

  // Create CSS variables for the colors
  const style = React.useMemo(() => {
    return Object.entries(config).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[`--color-${key}`] = value.color;

        return acc;
      },
      {},
    );
  }, [config]);

  return (
    <ChartContext.Provider value={{ config, activeKey, setActiveKey }}>
      <div
        className={cn("", className)}
        style={style as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </ChartContext.Provider>
  );
}

interface ChartTooltipProps extends React.ComponentProps<typeof Tooltip> {
  content?: React.ReactNode;
  trigger?: React.ReactNode;
}

function ChartTooltip({ content, trigger, ...props }: ChartTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent>{content}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ChartTooltipContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  payload?: Array<{
    name?: string;
    value?: string | number;
    payload?: Record<string, any>;
    dataKey?: string;
    fill?: string;
    stroke?: string;
  }>;
  active?: boolean;
  label?: string;
  formatter?: (
    value: number | string | undefined,
    name: string | undefined,
  ) => React.ReactNode;
  labelFormatter?: (label: string) => React.ReactNode;
}

function ChartTooltipContent({
  payload,
  active,
  label,
  formatter,
  labelFormatter,
  className,
  ...props
}: ChartTooltipContentProps) {
  const { config } = React.useContext(ChartContext);

  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "space-y-1.5 rounded-md border bg-background p-2 shadow-md",
        className,
      )}
      {...props}
    >
      {label && (
        <div className="text-xs font-medium text-foreground/60">
          {labelFormatter ? labelFormatter(label) : label}
        </div>
      )}
      <div className="space-y-1">
        {payload.map((item, index) => {
          const dataKey = item.dataKey || "";
          const name = item.name || dataKey;
          const color =
            item.fill || item.stroke || config[dataKey]?.color || "#888";
          const value = item.value;

          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: color,
                }}
              />
              <div className="font-medium">
                {config[dataKey]?.label || name}:{" "}
                {formatter ? (
                  formatter(value, name)
                ) : (
                  <span className="font-normal">{value}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent };
