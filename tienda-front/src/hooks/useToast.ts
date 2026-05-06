import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { addToast, ToastType } from "@/redux/features/toast-slice";

export const useToast = () => {
  const dispatch = useDispatch<AppDispatch>();

  const showToast = (message: string, type: ToastType = "success") => {
    dispatch(addToast({ message, type }));
  };

  return { showToast };
};
