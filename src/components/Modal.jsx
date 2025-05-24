import { createPortal } from "react-dom";
import { HiX } from "react-icons/hi";

function Modal({ children, close }) {
  return createPortal(
    <div className="fixed top-0 left-0 w-full h-full bg-opacity-50 backdrop-filter backdrop-blur-md z-999999 flex items-center justify-center">
      <div className="relative bg-gray-800 dark:bg-boxdark rounded-lg pt-1 pb-6 w-full max-w-[90%] md:max-w-[800px] px-12 transition duration-500 max-h-[90%] md:max-h-[680px] overflow-y-auto shadow-lg">
        <button
          onClick={close}
          className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-500 dark:hover:bg-stroke dark:text-white transition duration-200"
        >
          <HiX className="w-6 h-6 text-gray-300 " />
        </button>
        <div className="pt-4">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
