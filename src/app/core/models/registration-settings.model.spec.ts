import { isEmailAllowed } from './registration-settings.model';

describe('isEmailAllowed', () => {
  const uadyOnly = { allowed_domains: ['uady.mx'], allow_public_emails: false };

  it('allows the domain and its subdomains', () => {
    expect(isEmailAllowed('maestra@uady.mx', uadyOnly)).toBeTrue();
    expect(isEmailAllowed('a1234@alumnos.uady.mx', uadyOnly)).toBeTrue();
    expect(isEmailAllowed('ana@correo.UADY.mx', uadyOnly)).toBeTrue();
  });

  it('rejects other domains, including look-alikes', () => {
    expect(isEmailAllowed('ana@gmail.com', uadyOnly)).toBeFalse();
    expect(isEmailAllowed('ana@notuady.mx', uadyOnly)).toBeFalse();
    expect(isEmailAllowed('ana@uady.mx.evil.com', uadyOnly)).toBeFalse();
  });

  it('allows any email when public emails are on', () => {
    expect(
      isEmailAllowed('ana@gmail.com', { allowed_domains: [], allow_public_emails: true }),
    ).toBeTrue();
  });

  it('allows nobody when there are no domains and public emails are off', () => {
    expect(
      isEmailAllowed('ana@uady.mx', { allowed_domains: [], allow_public_emails: false }),
    ).toBeFalse();
  });
});
