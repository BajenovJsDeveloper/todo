import React from 'react';
import editIcon from '../../img/edit.png';
import deleteIcon from '../../img/delete.png';
import cn from 'classnames';

interface ItemProps {
  itemData: {
    titleDescription: string;
    description: string;
    createdAt: string;
    id: number;
    isCompleted: boolean;
    updatedAt: string;
    priority: string;
  };
  itemDone: (id: number) => void;
  editClick: (id: number, e: React.MouseEvent) => void;
  deleteClick: (id: number, e: React.MouseEvent) => void;
}

const TaskItem = (props: ItemProps) => {
  const { itemData, itemDone, editClick, deleteClick } = props;
  const classStyle = cn(
    'task-item',
    itemData.priority,
    { done: itemData.isCompleted },
    { working: !itemData.isCompleted },
    { 'only-title': !itemData.description }
  );
  // }
  //  `task-item ${itemData.isCompleted ? 'done' : 'working'} ${
  //   itemData.priority
  // } ${itemData.description === '' ? 'only-title' : ''}`;
  const isDescription = itemData.description === '' ? false : true;
  const title: string =
    itemData.titleDescription.length > 20
      ? itemData.titleDescription.slice(0, 20).concat('...')
      : itemData.titleDescription;

  return (
    <div className={classStyle} onClick={() => itemDone(itemData.id)}>
      <p>{title}</p>
      {isDescription && <p>{itemData.description}</p>}
      <p>Last modified on: {itemData.updatedAt}</p>
      <p>Created at: {itemData.createdAt}</p>
      <p>
        <span className="item-icons">
          <img
            alt="edit"
            onClick={(e) => editClick(itemData.id, e)}
            src={editIcon}
          />
          <img
            alt="del"
            onClick={(e) => deleteClick(itemData.id, e)}
            src={deleteIcon}
          />
        </span>
      </p>
    </div>
  );
};

export default TaskItem;
