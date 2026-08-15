import { useRef, useState } from 'react';

export default function useToast() {
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const timerRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    setIsToastVisible(true);

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      setIsToastVisible(false);
    }, 2000);
  };

  return {
    isToastVisible,
    toastMessage,
    showToast,
  };
}
