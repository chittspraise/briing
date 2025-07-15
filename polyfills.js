import { Buffer } from 'buffer';
import structuredClone from 'structured-clone';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = structuredClone;
}
