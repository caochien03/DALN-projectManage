import React from "react";

const Loading = ({ text = "Đang tải..." }) => (
    <div className="flex flex-col items-center justify-center h-64 w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <span className="text-gray-600 text-lg font-medium">{text}</span>
    </div>
);

export default Loading;
