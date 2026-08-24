import { http } from "@/lib/http";
import { buildQueryString } from "@/lib/query-string";
import type {
  DashboardOverview,
  DashboardOverviewParams,
} from "@/types/dashboard";

export const dashboardService = {
  overview(params: DashboardOverviewParams) {
    const query = buildQueryString(params);
    return http.get<DashboardOverview>(
      `/api/dashboard/overview/${query}`
    );
  },
};
