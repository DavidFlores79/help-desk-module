export type TicketStatus = 'open' | 'assigned' | 'in_progress' | 'awaiting_user' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface UserProfile {
  id: number;
  name: string; // 'Administrador', 'Usuario', 'SuperUser'
  code?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  profile_id?: number;
  my_profile?: UserProfile;
  profile?: UserProfile;
  department?: string;
  employee_id?: string;
  phone?: string;
  status?: number;
}

export interface Item {
  id: number;
  name: string;
  code: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface TicketCategory {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Assignment {
  id: number;
  user_id: number;
  item_id: number;
  assigned_date: string;
  returned_date?: string;
  status: string;
  user?: User;
  item?: Item;
}

export interface Attachment {
  id: number;
  filename: string;
  original_name: string;
  name: string;  // Add alias for display
  mime_type?: string;  // Optional - may not always be provided
  size: number;
  url: string;
  created_at: string;
}

export interface TicketResponse {
  id: number;
  ticket_id: number;
  user_id: number;
  body: string;
  message: string;  // Add alias for body
  internal: boolean;
  is_internal: boolean;  // Add alias for internal
  created_at: string;
  updated_at: string;
  user: User;
  attachments: Attachment[];
}

export interface TicketAssignment {
  id: number;
  ticket_id: number;
  assigned_by: number;
  assigned_to: number;
  created_at: string;
  assignedBy: User;
  assignedTo: User;
}

export interface Ticket {
  id: number;
  user_id: number;
  ticket_category_id: number | null;
  assignment_id: number | null;
  assigned_to: number | User | null;  // Can be ID or User object
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  status_label: string;
  priority_label: string;
  last_response_at: string | null;
  due_at: string | null;
  reopens: number;
  resolved_at: string | null;
  resolution_hours: number | null;
  last_reopened_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user: User;
  createdBy?: User;  // Alias for user
  ticketCategory?: TicketCategory | null;
  ticket_category?: TicketCategory | null;  // API snake_case alias
  assignment?: Assignment | null;
  assignedTo: User | null;
  responses?: TicketResponse[];
  assignments?: TicketAssignment[];
  attachments?: Attachment[];
}

export interface TicketListResponse {
  current_page: number;
  data: Ticket[];
  total: number;
  per_page: number;
  last_page: number;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  ticket_category_id?: number;
  assignment_id?: number;
  priority?: TicketPriority;
  attachments?: File[];
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  ticket_category_id?: number;
  assignment_id?: number;
  status?: TicketStatus;
  priority?: TicketPriority;
}

export interface CreateResponseDto {
  body: string;
  internal?: boolean;
  attachments?: File[];
}

export interface AssignTicketDto {
  assigned_to?: number;
  user_id?: number;  // Add alias for API compatibility
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assigned_to?: number;
  page?: number;
}
