/**
 * React Query Hooks for Analytics
 * Provides data fetching, caching, and state management for analytics
 */

import { useQuery, useMutation, UseQueryOptions } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api/analytics';
import type {
  RevenueTrend,
  RevenueSummary,
  CustomerSegment,
  DashboardMetrics,
  MenuPerformance,
  CategoryPerformance,
} from '@/services/api/analytics';

/**
 * Revenue Analytics Hooks
 */

export function useRevenueTrends(
  locationId: string,
  timeRange: string = 'monthly',
  options?: UseQueryOptions<RevenueTrend[]>
) {
  return useQuery({
    queryKey: ['revenue-trends', locationId, timeRange],
    queryFn: () => analyticsApi.getRevenueTrends(locationId, timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

export function useRevenueSummary(
  locationId: string,
  timeRange: string = 'monthly',
  options?: UseQueryOptions<RevenueSummary>
) {
  return useQuery({
    queryKey: ['revenue-summary', locationId, timeRange],
    queryFn: () => analyticsApi.getRevenueSummary(locationId, timeRange),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Customer Analytics Hooks
 */

export function useCustomerSegments(options?: UseQueryOptions<CustomerSegment[]>) {
  return useQuery({
    queryKey: ['customer-segments'],
    queryFn: () => analyticsApi.getCustomerSegments(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
}

export function useCustomerRetention(
  locationId: string,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: ['customer-retention', locationId],
    queryFn: () => analyticsApi.getCustomerRetention(locationId),
    staleTime: 10 * 60 * 1000,
    ...options,
  });
}

/**
 * Menu Analytics Hooks
 */

export function useMenuPerformance(
  locationId: string,
  timeRange: string = 'monthly',
  options?: UseQueryOptions<MenuPerformance[]>
) {
  return useQuery({
    queryKey: ['menu-performance', locationId, timeRange],
    queryFn: () => analyticsApi.getMenuPerformance(locationId, timeRange),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useCategoryPerformance(
  locationId: string,
  timeRange: string = 'monthly',
  options?: UseQueryOptions<CategoryPerformance[]>
) {
  return useQuery({
    queryKey: ['category-performance', locationId, timeRange],
    queryFn: () => analyticsApi.getCategoryPerformance(locationId, timeRange),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

/**
 * Dashboard Hooks
 */

export function useDashboardMetrics(
  locationId: string,
  options?: UseQueryOptions<DashboardMetrics>
) {
  return useQuery({
    queryKey: ['dashboard-metrics', locationId],
    queryFn: () => analyticsApi.getDashboardMetrics(locationId),
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard
    refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    ...options,
  });
}

/**
 * Forecasting Hooks
 */

export function useForecastMetrics(
  locationId: string,
  horizon: number = 30,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: ['forecast-metrics', locationId, horizon],
    queryFn: () => analyticsApi.getForecastMetrics(locationId, horizon),
    staleTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
}

/**
 * Recommendations Hook
 */

export function useRecommendations(
  locationId: string,
  options?: UseQueryOptions<any>
) {
  return useQuery({
    queryKey: ['recommendations', locationId],
    queryFn: () => analyticsApi.getRecommendations(locationId),
    staleTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
}

/**
 * Export Mutation
 */

export function useExportReport() {
  return useMutation({
    mutationFn: async ({
      format,
      params,
    }: {
      format: 'pdf' | 'excel' | 'csv';
      params: any;
    }) => {
      const blob = await analyticsApi.exportReport(format, params);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics-report-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return true;
    },
  });
}

/**
 * Combined Dashboard Data Hook
 * Fetches all data needed for the main dashboard
 */

export function useDashboardData(locationId: string, timeRange: string = 'monthly') {
  const metrics = useDashboardMetrics(locationId);
  const revenueTrends = useRevenueTrends(locationId, timeRange);
  const customerSegments = useCustomerSegments();
  const menuPerformance = useMenuPerformance(locationId, timeRange);

  return {
    metrics,
    revenueTrends,
    customerSegments,
    menuPerformance,
    isLoading:
      metrics.isLoading ||
      revenueTrends.isLoading ||
      customerSegments.isLoading ||
      menuPerformance.isLoading,
    isError:
      metrics.isError ||
      revenueTrends.isError ||
      customerSegments.isError ||
      menuPerformance.isError,
    error:
      metrics.error ||
      revenueTrends.error ||
      customerSegments.error ||
      menuPerformance.error,
  };
}
