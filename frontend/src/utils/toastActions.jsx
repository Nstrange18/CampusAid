import React, { useState } from 'react';
import { toast } from 'react-toastify';

const baseButtonClass = "px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors";
const toastOptions = {
  autoClose: false,
  closeOnClick: false,
  closeButton: false,
  draggable: false,
  className: "!rounded-xl !border !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !shadow-xl",
  bodyClassName: "!p-0 !m-0",
};
const cancelButtonClass = "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700";

export const confirmToast = ({
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmClassName = "bg-blue-600 hover:bg-blue-700 text-white",
}) => new Promise((resolve) => {
  const ConfirmContent = ({ closeToast }) => {
    const finish = (value) => {
      resolve(value);
      closeToast();
    };

    return (
      <div className="space-y-3 text-slate-900 dark:text-slate-100">
        <div>
          <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
          {message && <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">{message}</p>}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => finish(false)}
            className={`${baseButtonClass} ${cancelButtonClass}`}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => finish(true)}
            className={`${baseButtonClass} ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    );
  };

  toast(<ConfirmContent />, toastOptions);
});

const PromptContent = ({ title, message, placeholder, confirmLabel, cancelLabel, defaultValue, closeToast, resolve }) => {
  const [value, setValue] = useState(defaultValue);

  const finish = (result) => {
    resolve(result);
    closeToast();
  };

  return (
    <div className="space-y-3 text-slate-900 dark:text-slate-100">
      <div>
        <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
        {message && <p className="mt-1 text-xs leading-relaxed text-slate-700 dark:text-slate-200">{message}</p>}
      </div>
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => finish(null)}
          className={`${baseButtonClass} ${cancelButtonClass}`}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => finish(value)}
          className={`${baseButtonClass} bg-orange-600 hover:bg-orange-700 text-white`}
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
};

export const promptToast = ({
  title = "Add details",
  message,
  placeholder = "",
  confirmLabel = "Continue",
  cancelLabel = "Cancel",
  defaultValue = "",
}) => new Promise((resolve) => {
  toast(({ closeToast }) => (
    <PromptContent
      title={title}
      message={message}
      placeholder={placeholder}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      defaultValue={defaultValue}
      closeToast={closeToast}
      resolve={resolve}
    />
  ), toastOptions);
});
