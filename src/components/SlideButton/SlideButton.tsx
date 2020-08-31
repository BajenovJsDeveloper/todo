import React from 'react';

interface SButtonProps {
  toggleClick: () => void;
  rotateArrow: boolean;
}

const SlideButton: React.FC<SButtonProps> = (props: SButtonProps) => {
  const { toggleClick, rotateArrow } = props;
  return (
    <div className="cg-side-button" onClick={toggleClick}>
      <div className={`arrow ${rotateArrow ? 'rotate' : ''}`}></div>
    </div>
  );
};

export default SlideButton;
