import React from 'react';
import Modal from 'react-modal';

const CustomModal = ({ isOpen, closeModal, handleSubmit, title, children }) => {
    return (
        <Modal isOpen={isOpen} onRequestClose={closeModal} className="modal">
            <div className="modal-content">
                <h2>{title}</h2>
                <div>{children}</div>
                <button onClick={handleSubmit}>Submit</button>
                <button onClick={closeModal}>Close</button>
            </div>
        </Modal>
    );
};

export default CustomModal;
