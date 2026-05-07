import { httpbinHandlers } from './httpbin';
import { jsonPlaceholderHandlers } from './json-placeholder';

export const handlers = [...jsonPlaceholderHandlers, ...httpbinHandlers];
