import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addToast, ToastType } from "@/redux/features/toast-slice";
import { useCallback } from "react";

export const useToast = () => {
  const dispatch = useDispatch<AppDispatch>();

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    dispatch(addToast({ message, type }));
  }, [dispatch]);

  return { showToast };
};
