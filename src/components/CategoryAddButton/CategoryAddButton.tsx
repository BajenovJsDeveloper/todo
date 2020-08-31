import React from 'react';

interface Props {
  showModalClick: () => void;
}

function CategoryAddButton(props: Props) {
  const { showModalClick } = props;
  const showlClick = () => {
    showModalClick();
  };

  return (
    <div className="cg-button">
      <button onClick={showlClick} type="button">
        Add todos
      </button>
    </div>
  );
}

export default CategoryAddButton;
