/* Inline line icons (24px grid, 1.5 stroke, currentColor). Replaces all emoji. */
const PATHS = {
    tent: <path d="M3 20 12 4l9 16M12 4v16M8.5 20 12 13.5l3.5 6.5" />,
    mountain: <path d="m3 19 6-11 4 7 2-3 6 7H3Z" />,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
    pin: <><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" /><circle cx="12" cy="10" r="2.5" /></>,
    star: <path d="m12 3.5 2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.3-4.1 5.9-.9L12 3.5Z" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
    'arrow-left': <path d="M19 12H5m6-6-6 6 6 6" />,
    'chevron-left': <path d="m15 6-6 6 6 6" />,
    'chevron-right': <path d="m9 6 6 6-6 6" />,
    'chevron-down': <path d="m6 9 6 6 6-6" />,
    x: <path d="M6 6l12 12M18 6 6 18" />,
    check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
    alert: <><path d="M12 4 2.5 20h19L12 4Z" /><path d="M12 10v4M12 17v.01" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></>,
    trash: <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />,
    edit: <path d="M4 20h4L19 9a2.1 2.1 0 0 0-4-4L4 16v4ZM14 6l4 4" />,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    image: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m4 18 5-5 4 4 3-3 4 4" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></>,
    phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />,
    logout: <path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9" />,
    grid: <><rect x="4" y="4" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1" /></>,
    chat: <path d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-8l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />,
    tree: <path d="M12 3 6 11h3l-4 6h14l-4-6h3l-6-8ZM12 17v4" />,
    map: <path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2ZM9 4v14M15 6v14" />,
    ban: <><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></>,
    shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />,
    camera: <><path d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" /><circle cx="12" cy="13" r="3.5" /></>,
    send: <path d="m21 3-9.5 18-2-8L2 11l19-8ZM9.5 13 21 3" />,
    lock: <><rect x="5" y="11" width="14" height="9" rx="1.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
    external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
};

const Icon = ({ name, size = 20, label, className = '', filled = false, ...rest }) => {
    const body = PATHS[name];
    if (!body) return null;
    return (
        <svg
            className={`icon ${className}`.trim()}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            focusable="false"
            {...rest}
        >
            {body}
        </svg>
    );
};

export default Icon;
