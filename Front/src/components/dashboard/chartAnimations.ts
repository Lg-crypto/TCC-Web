import type { ApexOptions } from "apexcharts";

export function getDisabledChartAnimations(): NonNullable<
  NonNullable<ApexOptions["chart"]>["animations"]
> {
  return {
    enabled: false,
    speed: 0,
    animateGradually: { enabled: false },
    dynamicAnimation: { enabled: false, speed: 0 },
    respectReducedMotion: true,
  };
}
