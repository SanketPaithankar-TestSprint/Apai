export interface CallRequest {
  id: string;
  userId: number;
  ownerName: string;
  businessName: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  contactNumber: string;
  notes: string;
  adminNotes: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'NO_ANSWER' | 'CANCELLED';
  createdAt: string;
}

export interface CallRequestParams {
  date?: string;
  status?: string;
}

export interface UpdateCallRequestStatus {
  status: string;
}

export interface AddCallRequestNotes {
  adminNotes: string;
}
