const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Icon({ size = 20, children, ...rest }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...strokeProps}
      {...rest}
    >
      {children}
    </svg>
  );
}

export function ArrowLeftIcon(props) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </Icon>
  );
}

export function ChevronDownIcon(props) {
  return (
    <Icon {...props}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  );
}

export function CheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="M20 6L9 17l-5-5" />
    </Icon>
  );
}

export function ShieldCheckIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" />
      <path d="M9 11.5l2 2 4-4.5" />
    </Icon>
  );
}

export function BoltIcon(props) {
  return (
    <Icon {...props}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </Icon>
  );
}

export function LockIcon(props) {
  return (
    <Icon {...props}>
      <rect x="4" y="11" width="16" height="10" rx="2.5" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </Icon>
  );
}

export function PhoneIcon(props) {
  return (
    <Icon {...props}>
      <rect x="6" y="2" width="12" height="20" rx="3" />
      <path d="M11 18.5h2" />
    </Icon>
  );
}

export function WalletIcon(props) {
  return (
    <Icon {...props}>
      <rect x="2.5" y="6" width="19" height="14" rx="3" />
      <path d="M2.5 10h19" />
      <path d="M16.5 15h.01" />
    </Icon>
  );
}

export function InfoIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </Icon>
  );
}

export function AlertIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 7.5V13" />
      <path d="M12 16.5h.01" />
    </Icon>
  );
}

export function CheckCircleIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M8 12.5l2.5 2.5L16 9.5" />
    </Icon>
  );
}

export function LogOutIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 21H6a2 2 0 01-2-2V5a2 2 0 012-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Icon>
  );
}

export function SparkleIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 3l2 5.5L19.5 10 14 12l-2 5.5L10 12 4.5 10 10 8.5 12 3z" />
      <path d="M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
    </Icon>
  );
}

export function BellIcon(props) {
  return (
    <Icon {...props}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 01-3.4 0" />
    </Icon>
  );
}

export function HomeIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 10.5L12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </Icon>
  );
}

export function UserIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 21c1-4 4-6 7.5-6s6.5 2 7.5 6" />
    </Icon>
  );
}

export function FileTextIcon(props) {
  return (
    <Icon {...props}>
      <path d="M14 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V7l-5-5z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </Icon>
  );
}

export function CalendarIcon(props) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </Icon>
  );
}

export function ClipboardListIcon(props) {
  return (
    <Icon {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2.5" />
      <path d="M9 2.5h6v3H9z" />
      <path d="M9 11h6" />
      <path d="M9 15h4" />
    </Icon>
  );
}

export function ChevronRightIcon(props) {
  return (
    <Icon {...props}>
      <path d="M9 6l6 6-6 6" />
    </Icon>
  );
}

export function CloseIcon(props) {
  return (
    <Icon {...props}>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </Icon>
  );
}

export function UploadIcon(props) {
  return (
    <Icon {...props}>
      <path d="M12 15V3" />
      <path d="M7 8l5-5 5 5" />
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
    </Icon>
  );
}

export function CameraIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 19a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3l2-3h4l2 3h3a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </Icon>
  );
}

export function TrashIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2" />
      <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    </Icon>
  );
}

export function RefreshIcon(props) {
  return (
    <Icon {...props}>
      <path d="M21 12a9 9 0 11-2.64-6.36" />
      <path d="M21 3v6h-6" />
    </Icon>
  );
}

export function BankIcon(props) {
  return (
    <Icon {...props}>
      <path d="M3 9.5L12 4l9 5.5" />
      <path d="M5 10v8" />
      <path d="M9.5 10v8" />
      <path d="M14.5 10v8" />
      <path d="M19 10v8" />
      <path d="M3 20h18" />
    </Icon>
  );
}

export function SettingsIcon(props) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3" />
      <path d="M12 19v3" />
      <path d="M2 12h3" />
      <path d="M19 12h3" />
      <path d="M4.9 4.9l2.1 2.1" />
      <path d="M17 17l2.1 2.1" />
      <path d="M19.1 4.9L17 7" />
      <path d="M7 17l-2.1 2.1" />
    </Icon>
  );
}
