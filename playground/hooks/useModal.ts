import { useCallback, useContext } from 'react';
import { MODAL, ModalContext } from 'providers';

type UseModal = (modal: MODAL) => {
  openModal: () => void;
  closeModal: () => void;
};

export const useModal: UseModal = (modal) => {
  const methods = useContext(ModalContext);

  const openModal = useCallback(() => {
    methods.openModal(modal);
  }, [methods, modal]);

  return {
    openModal,
    closeModal: methods.closeModal,
  };
};
