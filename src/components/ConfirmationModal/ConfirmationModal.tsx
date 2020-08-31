import React, { useEffect, useRef } from 'react';
import './confirm.scss';

interface ConfObject {
  ok: () => void;
  cancel: () => void;
  text: string;
  title: string;
}

interface CProps {
  confirmData: ConfObject;
}

function ConfirmationModal<FC>(props: CProps) {
  const { ok, cancel, text, title } = props.confirmData;
  const btnRef = useRef<HTMLButtonElement>(null);

  const escClick = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(e.keyCode);
    if (e.keyCode === 27) cancel();
  };

  useEffect(() => {
    const btn = btnRef.current;
    if (btn) btn.focus();
  }, [btnRef]);
  return (
    <div className="confirm-modal">
      <div
        className="cm-background"
        tabIndex={9}
        onKeyDown={(e) => escClick(e)}
      ></div>

      <div
        className="cm-container"
        tabIndex={10}
        onKeyDown={(e) => escClick(e)}
      >
        <h3 className="cm-header">{title}</h3>
        <p className="cm-text">{text}</p>
        <button name="ok" tabIndex={5} onClick={ok}>
          Yes
        </button>
        <button ref={btnRef} name="cancel" onClick={cancel}>
          No
        </button>
      </div>
    </div>
  );
}

export default ConfirmationModal;
