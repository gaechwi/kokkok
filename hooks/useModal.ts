import { useState } from "react";

export default function useModal(initialState = false) {
  const [isModalVisible, setIsModalVisible] = useState<boolean>(initialState);

  const openModal = () => {
    setIsModalVisible(true);
  };
  const closeModal = () => {
    setIsModalVisible(false);
  };

  return { isModalVisible, openModal, closeModal };
}
