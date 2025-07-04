import { useState, useRef } from "react";
import {
    useFloating,
    offset,
    flip,
    shift,
    useClick,
    useDismiss,
    useRole,
    useInteractions,
    arrow,
} from "@floating-ui/react-dom-interactions";

export default function PopConfirmFloating({
    children,
    title = "Bạn có chắc chắn?",
    onConfirm,
    onCancel,
    okText = "Xác nhận",
    cancelText = "Hủy",
    placement = "top",
}) {
    const [open, setOpen] = useState(false);
    const arrowRef = useRef(null);

    const {
        x,
        y,
        reference,
        floating,
        strategy,
        context,
        middlewareData,
        placement: actualPlacement,
    } = useFloating({
        open,
        onOpenChange: setOpen,
        placement,
        middleware: [
            offset(8),
            flip(),
            shift({ padding: 8 }),
            arrow({ element: arrowRef }),
        ],
    });

    const { getReferenceProps, getFloatingProps } = useInteractions([
        useClick(context),
        useDismiss(context),
        useRole(context, { role: "dialog" }),
    ]);

    // Arrow positioning
    const staticSide = {
        top: "bottom",
        right: "left",
        bottom: "top",
        left: "right",
    }[actualPlacement.split("-")[0]];

    return (
        <div className="inline-block">
            <span
                ref={reference}
                {...getReferenceProps()}
                onClick={(e) => {
                    e.stopPropagation();
                    if (getReferenceProps().onClick) {
                        getReferenceProps().onClick(e);
                    }
                }}
            >
                {children}
            </span>
            {open && (
                <div
                    ref={floating}
                    {...getFloatingProps()}
                    style={{
                        position: strategy,
                        top: y ?? 0,
                        left: x ?? 0,
                        zIndex: 9999,
                        minWidth: 200,
                        background: "white",
                        borderRadius: 8,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                        border: "1px solid #eee",
                        padding: 16,
                    }}
                >
                    <div className="flex items-start space-x-2 mb-3">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg
                                className="w-4 h-4 text-yellow-500"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 leading-relaxed">
                                {title}
                            </p>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                                if (onCancel) onCancel();
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                                onConfirm();
                            }}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700"
                        >
                            {okText}
                        </button>
                    </div>
                    {/* Arrow */}
                    <div
                        ref={arrowRef}
                        style={{
                            position: "absolute",
                            width: "16px",
                            height: "8px",
                            [staticSide]: "-8px",
                            left:
                                middlewareData.arrow?.x != null
                                    ? `${middlewareData.arrow.x}px`
                                    : "",
                            top:
                                middlewareData.arrow?.y != null
                                    ? `${middlewareData.arrow.y}px`
                                    : "",
                        }}
                    >
                        <svg width="16" height="8">
                            <polygon
                                points="8,0 16,8 0,8"
                                fill="white"
                                stroke="#eee"
                            />
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
}
