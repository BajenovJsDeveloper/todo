import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import editIcon from '../../img/edit.png';
import deleteIcon from '../../img/delete.png';
import cn from 'classnames';
import { connect } from 'react-redux';
import { StateInit } from '../../store/reducer';

interface CItemProps {
  idx: number;
  keyDown: () => void;
  itemClick: (itemId: number) => void;
  editItem: (itemId: number) => void;
  itemDescription: string;
  itemId: number;
  curCatId?: number;
  innerRef?: any;
  deleteItem: (id: number) => void;
  createdAt: string;
  isCompleted: boolean;
}

const cutToshortString = (str: string): string => {
  return str.length > 18 ? str.slice(0, 17).concat('...') : str;
};

const CategoryItem: React.FC<CItemProps> = (props) => {
  const {
    idx,
    keyDown,
    editItem,
    itemClick,
    itemDescription,
    itemId,
    deleteItem,
    curCatId,
    createdAt,
    isCompleted,
  } = props;

  const style = cn(
    'cg-item',
    { active: curCatId === itemId },
    { 'cg-done': isCompleted }
  );

  return (
    <Draggable
      index={idx}
      key={`itemId-${'dragble'}`}
      draggableId={`item-${itemId}`}
    >
      {(provided, snapshot) => (
        <div
          key={itemId}
          ref={provided.innerRef}
          role="button"
          tabIndex={idx + 1}
          onKeyDown={keyDown}
          className={style}
          onClick={() => itemClick(itemId)}
          {...provided.dragHandleProps}
          {...provided.draggableProps}
        >
          <p>{cutToshortString(itemDescription)}</p>
          <span>
            <img
              alt="edit"
              src={editIcon}
              width="18"
              onClick={() => editItem(itemId)}
            />
            <img
              alt="del"
              src={deleteIcon}
              width="18"
              onClick={() => deleteItem(itemId)}
            />
          </span>
          <p>{createdAt}</p>
        </div>
      )}
    </Draggable>
  );
};

const mapStateToProps = (state: StateInit) =>({
	curCatId: state.currentCategoryId,
});


export default connect(mapStateToProps, null)(CategoryItem);
