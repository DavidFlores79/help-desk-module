/**
 * Self sign-up settings (GET/PUT /v1/settings/registration).
 * Admins can read them; only superusers can change them.
 */
export interface RegistrationSettings {
  /** Email domains that may sign up; each one also allows its subdomains */
  registration_allowed_domains: string[];
  /** When true, any email may sign up and the domain list is ignored */
  registration_allow_public_emails: boolean;
}

/** Public version of the same rules for the sign-up form (GET /v1/auth/registration-options). */
export interface RegistrationOptions {
  allowed_domains: string[];
  allow_public_emails: boolean;
}

/**
 * Whether these rules let this email sign up. Mirrors the API check:
 * "uady.mx" allows both @uady.mx and @alumnos.uady.mx.
 */
export function isEmailAllowed(email: string, options: RegistrationOptions): boolean {
  if (options.allow_public_emails) {
    return true;
  }

  const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase();

  return options.allowed_domains.some((allowed) => {
    const allowedDomain = allowed.toLowerCase();
    return domain === allowedDomain || domain.endsWith('.' + allowedDomain);
  });
}
