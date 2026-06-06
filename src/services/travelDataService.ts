import { serviceConfig } from './config';
import { mockTravelService } from './mockTravelService';
import { realApiService } from './realApiService';

export const travelDataService = serviceConfig.dataSource === 'api' ? realApiService : mockTravelService;
