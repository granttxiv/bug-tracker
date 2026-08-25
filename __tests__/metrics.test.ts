import {
  getVolumeMetrics,
  getResolutionTimeMetrics,
  getAgentPerformanceMetrics,
  getSLAComplianceMetrics,
  getTotalTickets,
} from "@/lib/services/metricsService";

describe("Metrics Service", () => {
  it("should have getVolumeMetrics function", () => {
    expect(typeof getVolumeMetrics).toBe("function");
  });

  it("should have getResolutionTimeMetrics function", () => {
    expect(typeof getResolutionTimeMetrics).toBe("function");
  });

  it("should have getAgentPerformanceMetrics function", () => {
    expect(typeof getAgentPerformanceMetrics).toBe("function");
  });

  it("should have getSLAComplianceMetrics function", () => {
    expect(typeof getSLAComplianceMetrics).toBe("function");
  });

  it("should have getTotalTickets function", () => {
    expect(typeof getTotalTickets).toBe("function");
  });
});
