import React, { useState } from 'react';
import { connect } from 'react-redux';
import { StateInit, Categoryes } from '../../store/reducer';
import CategoryAddButton from '../../components/CategoryAddButton/CategoryAddButton';
import CategoryList from '../../components/CategoryList/CategoryList';
import SlideButton from '../SlideButton/SlideButton';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import todoLogo from '../../img/todoLogo.png';
import { useHistory } from 'react-router-dom';
import { getIndexCatId } from '../../store/reducer';

interface Props {
  state: StateInit;
  selectCategory: (id: number) => void;
  showModalClick: () => void;
  deleteItem: (id: number) => void;
  catListStrArr: Array<string>;
}

function TodoCategories<FC>(props: Props) {
  const {
    state,
    selectCategory,
    showModalClick,
    catListStrArr,
    deleteItem,
  } = props;
  const [isShow, setVisibility] = useState<boolean>(false);
  const [confirm, setConfirm] = useState<{ visible: boolean; id?: number }>({
    visible: false,
  });
  const history = useHistory<History>();

  const categoryClick = (id: number) => {
    const urlStr = catListStrArr[getIndexCatId(state.categories, id)];
    history.push(urlStr);
    selectCategory(id);
  };

  const confirmOnDelete = (id: number) => {
    setConfirm({ visible: true, id });
  };

  const showModalForm = () => {
    setVisibility(!isShow);
  };

  const onDelConfirm = () => {
    if (confirm.id) {
      deleteItem(confirm.id);
      const catList: Categoryes[] = state.categories;
      if (catList.length > 0) {
        history.push('/todolist/category');
      } else {
        history.push('/todolist');
      }
      setConfirm({ visible: false });
    }
  };

  const onDelCancel = () => {
    setConfirm({ visible: false });
  };

  const confirmation = {
    title: 'Deleteing Category Item!',
    text: 'Are you sure?',
    ok: onDelConfirm,
    cancel: onDelCancel,
  };

  return (
    <>
      <div className="cg-title">
        <img alt="todo" src={todoLogo} />
        <h2> Todo categories </h2>
      </div>
      <div
        className={`back-font ${isShow ? 'fadein' : 'fadeout'}`}
        onClick={showModalForm}
      ></div>
      <SlideButton toggleClick={showModalForm} rotateArrow={isShow} />
      <div className={`cg-container ${isShow ? 'show' : 'hide'}`}>
        <CategoryList
          confirmOnDelete={confirmOnDelete}
          itemClick={categoryClick}
          categoryList={state.categories}
        />
        <CategoryAddButton showModalClick={showModalClick} />
      </div>
      {confirm.visible && <ConfirmationModal confirmData={confirmation} />}
    </>
  );
}
interface Dispatch {
  (type: { type: string; payload: number }): void;
}

const mapStateToProps = (state: StateInit) => ({ state });
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    selectCategory: (id: number) =>
      dispatch({ type: 'SELECT_CATEGORY', payload: id }),
    deleteItem: (id: number) =>
      dispatch({ type: 'DELETE_CATEGORY_ITEM', payload: id }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TodoCategories);
