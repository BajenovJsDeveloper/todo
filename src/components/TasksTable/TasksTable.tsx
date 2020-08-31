import React, { useState } from 'react';
import { TasksList } from '../../store/reducer';
import TaskItem from '../TaskItem/TaskItem';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import TaskEmpty from '../TaskEmpty/TaskEmpty';
import ModalForm, {
  Values,
  ErrorObject,
  MemoBox,
  Input,
  Radio,
} from '../ModalForm/ModalForm';
import { connect } from 'react-redux';

//---  DECLARE INTERFACES -------------------------

interface Props {
  tasksList: Array<TasksList>;
  categoryTitle: string;
  addTaskItem: (values: Values) => void;
  taskIsDone: (id: number) => void;
  editTask: (id: number, value: Values) => void;
  deleteTaskItem: (id: number) => void;
}

interface Modal {
  visible: boolean;
  data?: FormData;
  id?: number;
}

interface Confirm {
  visible: boolean;
  id?: number;
}

interface FormData {
  formTitle: string;
  radioLabel: string;
  inputBox: Input;
  onOK: (value: Values) => void;
  onCancel: () => void;
  memoBox: MemoBox;
  radioBox: Radio[] | undefined;
}

//------------------------------------------------

const MEMO_MAX_LEN = 200;
const TITLE_MAX_LEN = 30;

const createListPriority = (str: string = 'normal'): Radio[] => {
  let priority = ['normal', 'high', 'urgent'];
  return priority.map((i) => ({
    name: i,
    defaultChecked: i === str ? true : false,
  }));
};

function createModalInputData(tItem?: TasksList): FormData {
  const inputBox: Input = {
    name: 'task',
    label: 'Input task title:',
    placeholder: 'for example: To do something...',
    maxlen: TITLE_MAX_LEN,
    value: '',
    isRequired: true,
  };

  const memoBox: MemoBox = {
    label: 'Task description:',
    name: 'memo',
    placeholder: 'task description...',
    maxlen: MEMO_MAX_LEN,
    value: '',
  };

  let radioBox: Radio[] | undefined;
  const formData: FormData = {
    formTitle: 'Create new task',
    radioLabel: 'Select priority:',
    inputBox: inputBox,
    onOK: (value: Values) => {},
    onCancel: () => {},
    memoBox: memoBox,
    radioBox: radioBox,
  };

  if (tItem) {
    formData.formTitle = 'Edit task';
    inputBox.value = tItem.titleDescription;
    memoBox.value = tItem.description;
    radioBox = createListPriority(tItem.priority);
  } else {
    radioBox = createListPriority();
  }
  formData.radioBox = radioBox;
  return formData;
}

function addHandlersOnEvents(
  onOK: (value: Values) => void,
  onCancel: () => void,
  data?: FormData
) {
  if (data) {
    data.onOK = onOK;
    data.onCancel = onCancel;
    return data;
  }
  const dataDefault = createModalInputData();
  dataDefault.onOK = onOK;
  dataDefault.onCancel = onCancel;
  return dataDefault;
}

function TasksTable(props: Props) {
  const {
    tasksList,
    categoryTitle,
    addTaskItem,
    taskIsDone,
    editTask,
    deleteTaskItem,
  } = props;
  const [modal, setModal] = useState<Modal>({ visible: false });
  const [confirm, setConfirm] = useState<Confirm>({ visible: false });
  const isButton = categoryTitle === '' ? false : true;

  const addTask = () => {
    setModal({ visible: true });
  };
  const okClick = (values: Values) => {
    if (!modal.data) addTaskItem(values);
    if (modal.data && modal.id) editTask(modal.id, values);
    setModal({ visible: false });
  };
  const cancelClick = () => {
    setModal({ visible: false });
  };
  const itemDone = (id: number) => {
    taskIsDone(id);
  };

  const onEditTask = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const taskItem: TasksList | undefined = tasksList.find((t) => t.id === id);
    if (taskItem && !taskItem.isCompleted) {
      const inputData = createModalInputData(taskItem);
      setModal({ visible: true, data: inputData, id });
    }
  };

  const onDeleteItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const taskItem = tasksList.find((t) => t.id === id);
    if (taskItem && !taskItem.isCompleted) {
      setConfirm({ visible: true, id });
    }
  };

  const onDelConfirm = () => {
    if (confirm.id) {
      deleteTaskItem(confirm.id);
      setConfirm({ visible: false });
    }
  };

  const onDelCancel = () => {
    setConfirm({ visible: false });
  };

  const confirmation = {
    title: 'Deleteing Item!',
    text: 'Are you sure?',
    ok: onDelConfirm,
    cancel: onDelCancel,
  };

  return (
    <>
      <div className="task-title">{categoryTitle}</div>
      {tasksList.length === 0 && <TaskEmpty message="No task created." />}
      {isButton && (
        <div className="task-add-button" onClick={addTask}>
          {' '}
          +{' '}
        </div>
      )}
      {tasksList.length > 0 && (
        <div className="task-list">
          {tasksList.map((itemData, idx) => (
            <TaskItem
              key={itemData.id + 'task-item'}
              itemDone={itemDone}
              itemData={itemData}
              editClick={onEditTask}
              deleteClick={onDeleteItem}
            />
          ))}
        </div>
      )}
      {modal.visible && (
        <ModalForm
          inputData={addHandlersOnEvents(okClick, cancelClick, modal.data)}
        >
          {(error: ErrorObject) =>
            error && (
              <p>
                {error.input &&
                  error.input.empty &&
                  'Need to input task title!'}
                {error.input &&
                  error.input.maxlen &&
                  `Must be less then ${TITLE_MAX_LEN} chars!`}
                {error.memo &&
                  error.memo.empty &&
                  'Need to input task description!'}
                {error.memo &&
                  error.memo.maxlen &&
                  `Must be less then ${MEMO_MAX_LEN} chars!`}
              </p>
            )
          }
        </ModalForm>
      )}
      {confirm.visible && <ConfirmationModal confirmData={confirmation} />}
    </>
  );
}

interface Dispatch {
  (type: {
    type: string;
    payload?: Values | number;
    edit?: { id: number; value: Values };
    id?: number;
  }): void;
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  addTaskItem: (values: Values) =>
    dispatch({ type: 'ADD_TASK_ITEM', payload: values }),
  taskIsDone: (id: number) =>
    dispatch({ type: 'TASK_DONE_TOGGLE', payload: id }),
  editTask: (id: number, value: Values) =>
    dispatch({ type: 'EDIT_TASK', edit: { id, value } }),
  deleteTaskItem: (id: number) => dispatch({ type: 'DELETE_TASK_ITEM', id }),
});

export default connect(null, mapDispatchToProps)(TasksTable);
