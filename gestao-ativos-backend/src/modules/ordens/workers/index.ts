import { ProcessarOrdensWorker } from './processarOrdens/processarOrdens.worker';

export * from './processarOrdens/processarOrdens.worker';

export const ORDENS_WORKERS = [ProcessarOrdensWorker];
