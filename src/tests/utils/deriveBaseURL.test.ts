import * as chai from 'chai';

import { URLS } from '#constants';
import { deriveBaseURL } from '#utils';

const { expect } = chai;

describe('deriveBaseURL', () => {
  it('should return the overrideBaseURL if provided', () => {
    const overrideBaseURL = 'https://example.com/api';
    const baseURL = deriveBaseURL({ overrideBaseURL, api: 'rest' });
    expect(baseURL).to.equal(overrideBaseURL);
  });

  it('should return the baseRestApiURL if provided', () => {
    const baseRestApiURL = 'https://api.example.com';
    const baseURL = deriveBaseURL({ baseRestApiURL, api: 'rest' });
    expect(baseURL).to.equal(baseRestApiURL);
  });

  it('should return the baseWebSocketURL if provided for rest API', () => {
    const baseWebSocketURL = 'wss://websocket-test.example.com/';
    const baseURL = deriveBaseURL({ baseWebSocketURL, api: 'rest' });
    expect(baseURL).to.equal('https://api-test.example.com/');
  });

  it('should return the baseWebSocketURL if provided for websocket API', () => {
    const baseWebSocketURL = 'wss://websocket.example.com';
    const baseURL = deriveBaseURL({ baseWebSocketURL, api: 'websocket' });
    expect(baseURL).to.equal(baseWebSocketURL);
  });

  it('should return the baseRestApiURL if provided for websocket API', () => {
    const baseRestApiURL = 'https://api.example.com/';
    const baseURL = deriveBaseURL({ baseRestApiURL, api: 'websocket' });
    expect(baseURL).to.equal('wss://websocket.example.com/');
  });

  it('should return the production URL if no options are provided', () => {
    const baseURL = deriveBaseURL({ api: 'rest' });
    expect(baseURL).to.equal(URLS.production.v1.rest);
  });

  it('should return the sandbox URL if sandbox option is true', () => {
    const baseURL = deriveBaseURL({ sandbox: true, api: 'rest' });
    expect(baseURL).to.equal(URLS.sandbox.v1.rest);
  });

  it('should throw an error if baseURL cannot be derived', () => {
    // @ts-expect-error - testing failure
    expect(() => deriveBaseURL({ api: 'invalid' })).to.throw(
      /Invalid configuration/,
    );
  });
});
