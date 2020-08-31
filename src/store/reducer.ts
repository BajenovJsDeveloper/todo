import { Values } from '../components/ModalForm/ModalForm';
// import { todoList } from './todoList';

import { localStorageDataInit } from './todoList';

interface Edit {
  id: number;
  value: Values;
}

interface Actions {
  type: string;
  payload?:
    | Values
    | Edit
    | number
    | string
    | [number, number | null]
    | [string, number | null];
  edit?: Edit;
  id?: number;
}

export function getIndexCatId(catList: Categoryes[], id: number): number {
  return catList.findIndex((c: Categoryes) => c.id === id);
}

const INITIAL_ID = 0;
const APP_KEY_NAME = 'TodoAppliction';

class TaskItem {
  static _lastId: number | null = null;
  public id: number;
  public titleDescription: string;
  public description: string;
  public createdAt: string;
  public updatedAt: string;
  public priority: string;
  public isCompleted: boolean;
  constructor(values: Values, lastId: number = 1) {
    if (TaskItem._lastId === null) TaskItem._lastId = lastId;
    this.id = this.createNewID();
    this.titleDescription = values.inputValue;
    this.description = values.memoValue;
    this.createdAt = this.getNewDate();
    this.updatedAt = this.getNewDate();
    this.priority = this.convertToString(values.radioBox);
    this.isCompleted = false;
  }
  createNewID(): number {
    if (TaskItem._lastId !== null) {
      TaskItem._lastId += 1;
    } else {
      TaskItem._lastId = 1;
    }
    return TaskItem._lastId;
  }
  convertToString(p: Array<boolean>): string {
    const priority = ['normal', 'high', 'urgent'];
    return priority[p.findIndex((i) => i)];
  }
  getNewDate() {
    const date = new Date();
    const D = date.getDate().toString().padStart(2, '0');
    const M = date.getMonth().toString().padStart(2, '0');
    const Y = date.getFullYear().toString();
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    const dateString = `${D}.${M}.${Y} - ${h}:${m}:${s}`;
    return dateString;
  }
  update(values: Values) {
    this.titleDescription = values.inputValue;
    this.description = values.memoValue;
    this.updatedAt = this.getNewDate();
    this.priority = this.convertToString(values.radioBox);
  }
  static init(id: number) {
    TaskItem._lastId = id;
  }
}

function createTaskListObjects(todoList: TasksList[]) {
  const result = todoList.map((t: TasksList) => {
    t.__proto__ = TaskItem.prototype;
    return t;
  });
  return result;
}

function convertDataToObjects(data: StateInit) {
  const catList = data.categories;
  catList.forEach((c) => {
    c.__proto__ = CategoryItem.prototype;
    c.tasksList = createTaskListObjects(c.tasksList);
  });
  TaskItem.init(data.lastTaskId);
  CategoryItem.init(data.lastCatId);
  return data;
}

const initState = localStorageDataInit;

export interface TasksList {
  id: number;
  titleDescription: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  priority: string;
  __proto__?: any;
  update: (values: Values) => void;
  init?: (id: number) => void;
}

export interface Categoryes {
  id: number;
  description: string;
  createdAt: string;
  isCompleted: boolean;
  tasksList: Array<TasksList>;
  __proto__?: any;
  update: (value: string) => void;
  init?: (id: number) => void;
}

export interface StateInit {
  currentCategoryId: number | null;
  currentTaskId: number;
  lastCatId: number;
  lastTaskId: number;
  categories: Array<Categoryes>;
}

class CategoryItem {
  static _lastId: number | null = null;

  public id: number;
  public description: string;
  public isCompleted: boolean;
  public createdAt: string;
  public tasksList: [];
  constructor(title: string, lastId: number = 1) {
    if (CategoryItem._lastId === null) {
      CategoryItem._lastId = lastId;
    }
    this.id = this.createNewID();
    this.description = title;
    this.isCompleted = false;
    this.createdAt = this.getNewDate();
    this.tasksList = [];
  }
  getNewDate() {
    const date = new Date();
    const D = date.getDate().toString().padStart(2, '0');
    const M = date.getMonth().toString().padStart(2, '0');
    const Y = date.getFullYear().toString();
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    const dateString = `${D}.${M}.${Y} - ${h}:${m}:${s}`;
    return dateString;
  }
  createNewID() {
    if (CategoryItem._lastId !== null) CategoryItem._lastId += 1;
    else CategoryItem._lastId = 1;
    return CategoryItem._lastId;
  }
  static init(id: number) {
    CategoryItem._lastId = id;
  }
  update(value: string) {
    this.description = value;
    this.createdAt = this.getNewDate();
  }
}

function numberFrom(str: string) {
  const pr = ['normal', 'high', 'urgent'];
  const idx = pr.indexOf(str);
  return idx !== -1 ? idx : 0;
}

function sortTasksByPriority(
  tasksList: TasksList[],
  sign: boolean = false
): true {
  if (tasksList.length > 0) {
    tasksList.sort((a: TasksList, b: TasksList) => {
      if (sign) return numberFrom(a.priority) - numberFrom(b.priority);
      return numberFrom(b.priority) - numberFrom(a.priority);
    });
  }
  return true;
}

function sortTasksByIdOfPriority(
  tasksList: TasksList[],
  sign: boolean = false
): true {
  if (tasksList.length > 0) {
    tasksList.sort((a: TasksList, b: TasksList) => {
      if (a.priority === b.priority) {
        if (sign) return numberFrom(a.priority) - numberFrom(b.priority);
        return numberFrom(b.priority) - numberFrom(a.priority);
      }
      return 0;
    });
  }
  return true;
}

function getCurrentCatItem(catList: Categoryes[], id: number | null) {
  if (id !== null) {
    const curItem = catList.find((c) => c.id === id);
    return curItem;
  }
}
function getCurrentTaskItem(tasksList: TasksList[], id: number | null) {
  if (id !== null) {
    const curItem = tasksList.find((t) => t.id === id);
    return curItem;
  }
}

function sortTasks(tasksList: TasksList[]) {
  sortTasksByPriority(tasksList);
  sortTasksByIdOfPriority(tasksList);
}

function completeCategory(catItem: Categoryes): boolean {
  let isDone: boolean = false;
  if (catItem.tasksList.length > 0) {
    isDone = catItem.tasksList.every((t) => t.isCompleted);
    catItem.isCompleted = isDone;
  }
  return isDone;
}

function saveDataToStorage(data: StateInit) {
  localStorage.setItem(APP_KEY_NAME, JSON.stringify(data));
}

//-------------------------------------------------------------------------

const reducer = function (state: StateInit = initState, action: Actions) {
  const newState = { ...state };
  switch (action.type) {
    case 'ADD_CATEGORY':
      {
        const valuesArr = action.payload as Values;
        const title: string = valuesArr.inputValue;
        const newCategory = new CategoryItem(title, newState.lastCatId);
        newState.categories.push(newCategory);
        newState.currentCategoryId = newCategory.id;
        newState.lastCatId = newCategory.id;
      }
      break;
    case 'SELECT_CATEGORY':
      if (typeof action.payload === 'number') {
        newState.currentCategoryId = action.payload;
      }
      break;
    case 'DELETE_CATEGORY_ITEM':
      {
        const idx = newState.categories.findIndex(
          (i) => i.id === action.payload
        );
        newState.categories.splice(idx, 1);
        newState.currentCategoryId = null;
        if (newState.categories.length === 0) {
          CategoryItem.init(INITIAL_ID);
          newState.lastCatId = INITIAL_ID;
        }
      }
      break;
    case 'EDIT_CATEGORY_TITLE':
      {
        const [title, id] = action.payload as [string, number | null];
        const catItem = getCurrentCatItem(newState.categories, id);
        if (catItem) {
          catItem.update(title);
        }
      }
      break;
    case 'REODER_CATEGORY':
      {
        const [source, dest] = action.payload as [number, number | null];
        if (dest !== null) {
          const item = newState.categories.splice(source, 1)[0];
          newState.categories.splice(dest, 0, item);
        }
      }
      break;
    case 'ADD_TASK_ITEM':
      if (action.payload) {
        const values = action.payload as Values;
        const newTaskItem = new TaskItem(values, state.lastTaskId);
        const catID = newState.currentCategoryId;
        const catItem = newState.categories.find((c) => c.id === catID);
        if (catItem) {
          catItem.tasksList.push(newTaskItem);
          newState.lastTaskId = newTaskItem.id;
          sortTasks(catItem.tasksList);
        }
      }
      break;
    case 'TASK_DONE_TOGGLE':
      {
        const taskId = action.payload as number;
        const catID = newState.currentCategoryId;
        if (catID !== null) {
          const catItem = getCurrentCatItem(newState.categories, catID);
          if (catItem) {
            let currentTask = getCurrentTaskItem(catItem.tasksList, taskId);
            if (currentTask) {
              let newTask = Object.assign(currentTask);
              newTask.isCompleted = !currentTask.isCompleted;
              const newList = [...catItem.tasksList];
              const idx = newList.findIndex((t) => t.id === taskId);
              newList.splice(idx, 1, newTask);
              catItem.tasksList = newList;
              completeCategory(catItem);
            }
          }
        }
      }
      break;
    case 'EDIT_TASK':
      if (action.edit) {
        const catItem = getCurrentCatItem(
          newState.categories,
          newState.currentCategoryId
        );
        if (catItem) {
          const taskItem = getCurrentTaskItem(
            catItem.tasksList,
            action.edit.id
          );
          if (taskItem) taskItem.update(action.edit.value);
          sortTasks(catItem.tasksList);
        }
      }
      break;
    case 'DELETE_TASK_ITEM':
      {
        const catItem: Categoryes | undefined = getCurrentCatItem(
          newState.categories,
          newState.currentCategoryId
        );
        if (catItem) {
          const taskIDX = catItem.tasksList.findIndex(
            (t) => t.id === action.id
          );
          const newTaskList = [...catItem.tasksList];
          newTaskList.splice(taskIDX, 1);
          catItem.tasksList = newTaskList;
          completeCategory(catItem);
          if (newTaskList.length > 0) {
            sortTasks(catItem.tasksList);
          } else {
            newState.lastTaskId = INITIAL_ID;
            TaskItem.init(INITIAL_ID);
          }
        }
      }
      break;
    case 'LOAD_DATA_FROM_STORAGE':
      {
        const storage = localStorage;
        // storage.setItem('TodoAppliction',JSON.stringify(localStorageDataInit));
        const dataStr = storage.getItem(APP_KEY_NAME);
        if (dataStr) {
          const parsedData = JSON.parse(dataStr);
          console.log('LOaded data: ', parsedData);
          try{
            const convertedData = convertDataToObjects(parsedData);
            return convertedData;
          }
          catch(e){
           console.log('Can`t load data from localStorage!');
           console.log('something in received data is wrong!',e.message); 
          }
        }
      }
      break;
  }
  if (action.payload || action.edit || action.id) {
    saveDataToStorage(newState);
    // console.log('Save state:', newState, action);
  }
  return newState;
};

export { reducer };
