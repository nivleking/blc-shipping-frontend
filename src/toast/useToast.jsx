import { toast } from "react-toastify";

const useToast = () => {
  const showSuccess = (message) => {
    toast.success(message, {
      toastId: `success-${message}`,
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const showError = (message) => {
    toast.error(message, {
      toastId: `error-${message}`,
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const showInfo = (message) => {
    toast.info(message, {
      toastId: `info-${message}`,
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const showWarning = (message) => {
    toast.warning(message, {
      toastId: `warning-${message}`,
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  return { showSuccess, showError, showInfo, showWarning };
};

export default useToast;
