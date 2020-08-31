/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import './index.scss';
import { connect } from 'react-redux';
import { StateInit, Categoryes } from '../store/reducer';
import TodoCategories from './TodosCategory/TodoCategory';
import TasksTable from './TasksTable/TasksTable';
import TaskEmpty from './TaskEmpty/TaskEmpty';
import ModalForm, { Values, ErrorObject } from './ModalForm/ModalForm';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';

interface Props {
  state: StateInit;
  addTask: (values: Values) => void;
  loadDataFromStorage: () => void;
  selectCategory: (id: number) => void;
}
interface ClickOK {
  (value: Values): void;
}

function getCurrentTaskItem(catList: Categoryes[], catId: number | null) {
  const currentItemEmpty = {
    description: '',
    tasksList: [],
  };
  const catItem = catList.find((c: Categoryes) => c.id === catId);
  return catItem ? catItem : currentItemEmpty;
}

function getCatListURLArr(catList: Categoryes[]): string[] {
  const urlArr = catList.map((i) => `/todolist/category/${i.id}`);
  if (urlArr.length === 0) urlArr.push('/');
  return urlArr;
}

const TITLE_MAX_LENGTH = 30;

function createInputData(okClick: ClickOK, cancelClick: () => void) {
  return {
    formTitle: 'Create new category',
    inputBox: {
      name: 'category',
      label: 'Input category name',
      placeholder: 'for example: Home work',
      maxlen: TITLE_MAX_LENGTH,
      value: '',
      isRequired: true,
    },
    onOK: okClick,
    onCancel: cancelClick,
  };
}

function getUrlOnLoadData(state: StateInit): string {
  const urlString =
    state.categories.length > 0
      ? `/todolist/category/${state.currentCategoryId}`
      : `/todolist`;

  return urlString;
}

function Todos<FC>(props: Props) {
  const { addTask, state, loadDataFromStorage, selectCategory } = props;

  const [visible, setVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const currentItem = getCurrentTaskItem(
    state.categories,
    state.currentCategoryId
  );
  const categoryTitle: string = currentItem.description;
  const catListStrArr: string[] = getCatListURLArr(state.categories);
  const history = useHistory();
  // history.listen(()=>console.log('Watched'));
  const catLength: number = state.categories.length;

  const okClick = (values: Values): void => {
    addTask(values);
    setVisible(false);
    const newCatLIst = getCatListURLArr(state.categories);
    const idx = state.categories.length - 1;
    history.push(newCatLIst[idx]);
  };
  const cancelClick = (): void => {
    setVisible(false);
  };
  const showModalClick = (): void => {
    setVisible(true);
  };

  useEffect(() => {
    console.log('Load Locale Storage...');
    loadDataFromStorage();
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      console.log('History: ',history);
      history.push(getUrlOnLoadData(state));
    }
  }, [loaded]);

  return (
    <>
      {visible && (
        <ModalForm inputData={createInputData(okClick, cancelClick)}>
          {(error: ErrorObject) =>
            error && (
              <p>
                {error.input &&
                  error.input.empty &&
                  'Need to input category name!'}
                {error.input &&
                  error.input.maxlen &&
                  `Must be less then ${TITLE_MAX_LENGTH} chars!`}
              </p>
            )
          }
        </ModalForm>
      )}
      <div className="container">
        <TodoCategories
          showModalClick={showModalClick}
          catListStrArr={catListStrArr}
        />
        {
          <Switch>
            <Route
              exact
              path={catListStrArr}
              render={() => (
                <TasksTable
                  categoryTitle={categoryTitle}
                  tasksList={currentItem.tasksList}
                />
              )}
            />
            <Route
              exact
              path={'/todolist/category'}
              render={() => <TaskEmpty message="Category not selected." />}
            />
            <Route
              exact
              path={catLength === 0 ? '/todolist' : '/'}
              render={() => (
                <TaskEmpty title="No categories." message="No tasks." />
              )}
            />
            <Redirect to={catListStrArr[0]} />
          </Switch>
        }
      </div>
    </>
  );
}

interface Dispatch {
  (data: { type: string; payload?: number | Values }): void;
}

const mapStetaToProps = (state: StateInit) => ({ state });
const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    addTask: (values: Values) =>
      dispatch({ type: 'ADD_CATEGORY', payload: values }),
    loadDataFromStorage: () => dispatch({ type: 'LOAD_DATA_FROM_STORAGE' }),
    selectCategory: (id: number) =>
      dispatch({ type: 'SELECT_CATEGORY', payload: id }),
  };
};

const connector = connect(mapStetaToProps, mapDispatchToProps);

export default connector(Todos);
