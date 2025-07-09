import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function ProjectSearchFilter({
    searchTerm,
    onSearchChange,
    departments,
    selectedDepartment,
    onDepartmentChange,
    onClearFilters,
    onFilter,
}) {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Search Input */}
                <div className="flex-1 relative w-full">
                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm dự án theo tên..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
                {/* Department Filter */}
                <div className="sm:w-64 w-full">
                    <select
                        value={selectedDepartment}
                        onChange={(e) => onDepartmentChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Tất cả phòng ban</option>
                        {departments.map((dept) => (
                            <option key={dept._id} value={dept._id}>
                                {dept.name}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Filter Button */}
                <button
                    onClick={onFilter}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
                >
                    Lọc
                </button>
                {/* Clear Filters Button */}
                {(searchTerm || selectedDepartment) && (
                    <button
                        onClick={onClearFilters}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
                    >
                        <XMarkIcon className="h-5 w-5" />
                        Xóa bộ lọc
                    </button>
                )}
            </div>
        </div>
    );
}
