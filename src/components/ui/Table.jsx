import Button from './Button';

/**
 * Table wrapper: horizontal scroll on small screens, styled header/rows.
 * Usage: <Table label="Users"><thead>…</thead><tbody>…</tbody></Table>
 * Cell helpers: className="num" (right-aligned numbers), "actions" (right-aligned buttons).
 */
const Table = ({ label, children, className = '' }) => (
    <div className="table-wrap" role="region" aria-label={label} tabIndex={0}>
        <table className={`table-ui ${className}`.trim()}>{children}</table>
    </div>
);

/** Prev / next pager with "Page x of y". Pure presentation; parent owns state. */
export const Pagination = ({ page, pages, total, onChange, label = 'Pagination' }) => {
    if (pages <= 1) return null;
    return (
        <nav className="pager" aria-label={label}>
            <span>{total != null ? `${total} total · ` : ''}Page {page} of {pages}</span>
            <div className="pager__btns">
                <Button size="sm" icon="chevron-left" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
                <Button size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>
                    Next
                    <span className="sr-only"> page</span>
                </Button>
            </div>
        </nav>
    );
};

export default Table;
