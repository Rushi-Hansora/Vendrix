import { Chip } from '@mui/material';

const STATUS_MAP = {
  // RFQ
  DRAFT:        { color: 'default',   label: 'Draft' },
  PUBLISHED:    { color: 'info',      label: 'Published' },
  CLOSED:       { color: 'secondary', label: 'Closed' },
  CANCELLED:    { color: 'error',     label: 'Cancelled' },
  // Quotation
  SUBMITTED:    { color: 'info',      label: 'Submitted' },
  UNDER_REVIEW: { color: 'warning',   label: 'Under Review' },
  APPROVED:     { color: 'success',   label: 'Approved' },
  REJECTED:     { color: 'error',     label: 'Rejected' },
  // Approval
  PENDING:      { color: 'warning',   label: 'Pending' },
  // PO
  ACTIVE:       { color: 'success',   label: 'Active' },
  COMPLETED:    { color: 'secondary', label: 'Completed' },
  // Invoice
  GENERATED:    { color: 'info',      label: 'Generated' },
  SENT:         { color: 'primary',   label: 'Sent' },
  PAID:         { color: 'success',   label: 'Paid' },
  // Vendor
  INACTIVE:     { color: 'default',   label: 'Inactive' },
  BLACKLISTED:  { color: 'error',     label: 'Blacklisted' },
};

export default function StatusChip({ status, size = 'small' }) {
  const cfg = STATUS_MAP[status] || { color: 'default', label: status };
  return <Chip label={cfg.label} color={cfg.color} size={size} variant="filled" />;
}
