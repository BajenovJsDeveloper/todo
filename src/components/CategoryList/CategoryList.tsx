import React, { useState } from 'react';
import { Categoryes } from '../../store/reducer';
import CategoryItem from '../CategoryItem/CategoryItem';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import ModalForm, { Values, ErrorObject } from '../ModalForm/ModalForm';

interface CListProps {
  categoryList: Array<Categoryes>;
  itemClick: (itemid: number) => void;
  // curCatId: number;
  reorderCategoryList: (data: [number, number | null]) => void;
  editCategoryTitle: (data: string, id: number | null) => void;
  confirmOnDelete: (id: number) => void;
}
interface EditObject {
  visible: boolean;
  id: number | null;
}

const CategoryList: React.FC<CListProps> = (props: CListProps) => {
  const {
    // curCatId,
    categoryList,
    itemClick,
    editCategoryTitle,
    reorderCategoryList,
    confirmOnDelete,
  } = props;
  const editObject: EditObject = { visible: false, id: null };
  const [editModal, setEditModal] = useState<EditObject>(editObject);
  const curCatItem = categoryList.find((i) => i.id === editModal.id);
  const inputValue = curCatItem ? curCatItem.description : '';
  const keyDown = () => {
    //
  };
  const onDragEnd = (result: any) => {
    // Drag end
    console.log(result);
    const dest: number | null = result.destination
      ? result.destination.index
      : null;
    const source: number = result.source.index;
    reorderCategoryList([source, dest]);
  };

  const editClick = (id: number) => {
    setEditModal({ visible: true, id });
  };
  const okClick = (values: Values) => {
    editCategoryTitle(values.inputValue, editModal.id);
    setEditModal(editObject);
  };
  const cancelClick = () => {
    setEditModal(editObject);
  };

  const deleteClick = (id: number) => {
    confirmOnDelete(id);
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      {editModal.visible && (
        <ModalForm
          inputData={{
            formTitle: 'Edit category title',
            inputBox: {
              name: 'category',
              label: 'Input new category name',
              placeholder: 'for example: Home work',
              maxlen: 20,
              value: inputValue,
              isRequired: true,
            },
            onOK: okClick,
            onCancel: cancelClick,
          }}
        >
          {(error: ErrorObject) =>
            error && (
              <p>
                {error.input &&
                  error.input.empty &&
                  'Need to input new category name!'}
                {error.input &&
                  error.input.maxlen &&
                  'Must be less then 20 chars!'}
              </p>
            )
          }
        </ModalForm>
      )}
      <Droppable droppableId={'Category'}>
        {(provided, snapshot) => (
          <div className="cg-list" ref={provided.innerRef}>
            {categoryList.map((item, idx) => (
              <CategoryItem
                key={`item-${item.id}`}
                idx={idx}
                editItem={editClick}
                deleteItem={deleteClick}
                keyDown={keyDown}
                itemClick={itemClick}
                itemDescription={item.description}
                itemId={item.id}
                // curCatId={curCatId}
                createdAt={item.createdAt}
                isCompleted={item.isCompleted}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

interface Dispatch {
  (obj: {
    type: string;
    payload: [number, number | null] | [string, number | null] | number;
  }): void;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  reorderCategoryList: (data: [number, number | null]) =>
    dispatch({ type: 'REODER_CATEGORY', payload: data }),
  editCategoryTitle: (data: string, id: number | null) =>
    dispatch({ type: 'EDIT_CATEGORY_TITLE', payload: [data, id] }),
});

export default connect(null, mapDispatchToProps)(CategoryList);
