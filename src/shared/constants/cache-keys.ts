export const vehicleLocationLatestCacheKey = (serviceRequestId: number) =>
  `vehicle-location:latest:${serviceRequestId}`;

/** 24h — cache is refreshed on every IoT update; TTL is a safety net only. */
export const VEHICLE_LOCATION_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
