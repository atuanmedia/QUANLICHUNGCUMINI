// frontend/src/components/common/Spinner.jsx
import React from 'react';

const Spinner = () => {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
};

export default Spinner;
