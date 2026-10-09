/**
 * Ticket email notification settings (GET/PUT /v1/settings/notifications).
 * Admins can read them; only superusers can change them.
 */
export interface NotificationSettings {
  /** Alert support when a ticket is created */
  ticket_created_enabled: boolean;
  /** ...to every active admin */
  ticket_created_notify_all_admins: boolean;
  /** ...to the admin who created it on behalf of a user */
  ticket_created_notify_creator: boolean;
  /** ...and to these extra addresses (max 10) */
  ticket_created_extra_emails: string[];
  /** Email the owner when support replies (internal notes are never emailed) */
  response_notify_owner: boolean;
  /** Email support when the owner replies or reopens the ticket */
  owner_reply_notify_support: boolean;
  /** Email the owner when the status changes (resolved always has its own email) */
  status_change_notify_owner: boolean;
}
