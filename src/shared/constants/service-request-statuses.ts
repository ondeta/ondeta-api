import { StatusServiceRequest } from '@/shared/enums';

/** Service request statuses that block assigning a new visit to the same vehicle. */
export const VEHICLE_OCCUPIED_STATUSES: StatusServiceRequest[] = [
  StatusServiceRequest.Agendado,
  StatusServiceRequest.EmRota,
];

/** Statuses in which the IoT device may report GPS coordinates. */
export const VEHICLE_TRACKABLE_STATUSES: StatusServiceRequest[] = [
  StatusServiceRequest.EmRota,
];
