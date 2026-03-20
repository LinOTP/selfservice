import { isOriginValidForRpId } from './fido2-utils';

describe('fido2-utils', () => {

  describe('isOriginValidForRpId', () => {

    describe('exact hostname match', () => {
      it('should return true when rpId matches hostname exactly', () => {
        expect(isOriginValidForRpId('https://selfservice.example.com', 'selfservice.example.com')).toBe(true);
      });

      it('should return true for a simple domain', () => {
        expect(isOriginValidForRpId('https://example.com', 'example.com')).toBe(true);
      });

      it('should be case-insensitive', () => {
        expect(isOriginValidForRpId('https://SelfService.Example.COM', 'selfservice.example.com')).toBe(true);
        expect(isOriginValidForRpId('https://selfservice.example.com', 'SelfService.Example.COM')).toBe(true);
      });
    });

    describe('partial FQDN match (registrable domain suffix)', () => {
      it('should return true when rpId is a registrable suffix of the hostname', () => {
        expect(isOriginValidForRpId('https://selfservice.example.com', 'example.com')).toBe(true);
      });

      it('should return true for deeper subdomain hierarchies', () => {
        expect(isOriginValidForRpId('https://app.selfservice.example.com', 'example.com')).toBe(true);
        expect(isOriginValidForRpId('https://app.selfservice.example.com', 'selfservice.example.com')).toBe(true);
      });

      it('should return true for multi-part TLD like .co.uk', () => {
        expect(isOriginValidForRpId('https://selfservice.example.co.uk', 'example.co.uk')).toBe(true);
      });
    });

    describe('incorrect / non-matching', () => {
      it('should return false when rpId is a different subdomain', () => {
        expect(isOriginValidForRpId('https://selfservice.example.com', 'other.example.com')).toBe(false);
      });

      it('should return false when rpId is a completely different domain', () => {
        expect(isOriginValidForRpId('https://selfservice.example.com', 'evil.com')).toBe(false);
      });

      it('should return false when rpId is a TLD only', () => {
        expect(isOriginValidForRpId('https://selfservice.example.com', 'com')).toBe(false);
      });

      it('should return false when rpId is a partial suffix but not at a dot boundary', () => {
        expect(isOriginValidForRpId('https://myexample.com', 'example.com')).toBe(false);
      });

      it('should return false when hostname is a suffix of rpId (rpId longer)', () => {
        expect(isOriginValidForRpId('https://example.com', 'selfservice.example.com')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return false for empty origin', () => {
        expect(isOriginValidForRpId('', 'example.com')).toBe(false);
      });

      it('should return false for empty rpId', () => {
        expect(isOriginValidForRpId('https://example.com', '')).toBe(false);
      });

      it('should return false for null/undefined values', () => {
        expect(isOriginValidForRpId(null, 'example.com')).toBe(false);
        expect(isOriginValidForRpId('https://example.com', null)).toBe(false);
        expect(isOriginValidForRpId(undefined, undefined)).toBe(false);
      });

      it('should return false for invalid origin URL', () => {
        expect(isOriginValidForRpId('not-a-url', 'example.com')).toBe(false);
      });

      it('should handle origin with port', () => {
        expect(isOriginValidForRpId('https://selfservice.example.com:8443', 'selfservice.example.com')).toBe(true);
        expect(isOriginValidForRpId('https://selfservice.example.com:8443', 'example.com')).toBe(true);
      });

      it('should handle localhost', () => {
        expect(isOriginValidForRpId('https://localhost', 'localhost')).toBe(true);
        expect(isOriginValidForRpId('https://localhost:4200', 'localhost')).toBe(true);
      });
    });
  });
});
