import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

const statusColors = {
    todo: "default",
    in_progress: "primary",
    review: "warning",
    completed: "success",
    open: "info",
    closed: "error",
};

function DataTable({
    columns,
    data,
    onEdit,
    onDelete,
    onRowClick,
    getStatusColor = (status) => statusColors[status] || "default",
}) {
    const renderCell = (row, column) => {
        const value = row[column.field];

        if (column.type === "status") {
            return (
                <Chip
                    label={value}
                    color={getStatusColor(value)}
                    size="small"
                />
            );
        }

        // Handle nested objects
        if (value && typeof value === "object") {
            if (column.field === "manager") {
                return value.name || "Unassigned";
            }
            return JSON.stringify(value);
        }

        return value;
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        {columns.map((column) => (
                            <TableCell key={column.field}>
                                {column.headerName}
                            </TableCell>
                        ))}
                        {(onEdit || onDelete) && (
                            <TableCell align="right">Actions</TableCell>
                        )}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow
                            key={row._id}
                            onClick={() => onRowClick && onRowClick(row)}
                            sx={{
                                cursor: onRowClick ? "pointer" : "default",
                                "&:hover": {
                                    backgroundColor: onRowClick
                                        ? "action.hover"
                                        : "inherit",
                                },
                            }}
                        >
                            {columns.map((column) => (
                                <TableCell key={`${row._id}-${column.field}`}>
                                    {renderCell(row, column)}
                                </TableCell>
                            ))}
                            {(onEdit || onDelete) && (
                                <TableCell align="right">
                                    {onEdit && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit(row);
                                            }}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                    {onDelete && (
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete(row);
                                            }}
                                            color="error"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

export default DataTable;
