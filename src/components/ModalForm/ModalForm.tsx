import React from 'react';
import { useState, useRef, useEffect } from 'react';
import './modal.scss';

export interface Radio {
  name: string;
  defaultChecked: boolean;
}
export interface MemoBox {
  name: string;
  label: string;
  placeholder: string;
  maxlen: number;
  value?: string;
  isRequired?: boolean;
}
export interface Input extends MemoBox {}

export interface ErrorItem {
  empty: boolean;
  maxlen: boolean;
  valid: boolean;
}
export interface ErrorObject {
  input?: ErrorItem;
  memo?: ErrorItem;
  radio?: ErrorItem;
}

export interface InputDataObject {
  formTitle: string;
  radioLabel?: string;
  onOK: (value: Values) => void;
  onCancel: () => void;
  inputBox: Input;
  radioBox?: Array<Radio>;
  memoBox?: MemoBox;
}

interface ModalProps {
  inputData: InputDataObject;
  children: any;
}

function resetValues(value: Values, intialValue: InputDataObject): Values {
  const newValue: Values = { ...value };
  newValue.inputValue = '';
  newValue.memoValue = '';
  newValue.radioBox = intialValue.radioBox
    ? intialValue.radioBox.map((r: Radio, idx) => r.defaultChecked)
    : [];
  return newValue;
}

function trimValues(value: Values): Values {
  const newValue = { ...value };
  newValue.inputValue = newValue.inputValue.trim();
  newValue.memoValue = newValue.memoValue.trim();
  return newValue;
}

function validateRadioBox(value: boolean[]): boolean {
  return value.some((i) => i);
}

function validateData(value: string, maxlen: number, isReq?: boolean): boolean {
  // console.log('String: ',value ,'Len:',maxlen);
  if (isReq) {
    return value.trim().length === 0 || value.trim().length > maxlen
      ? false
      : true;
  }
  return value.trim().length > maxlen ? false : true;
}

function getObjectError(value: string, maxLength: number | undefined) {
  const empty = value.trim() ? false : true;
  const maxlen = maxLength ? value.length > maxLength : true;
  // ... here must be some realization for valid property
  return { empty, maxlen, valid: false };
}
function getRadioObjectError(radio: Array<Radio>) {
  const empty = radio.some((i: Radio) => i.defaultChecked);
  return { empty, maxlen: false, valid: false };
}

function toCharString(str: string | null) {
  if (str !== null) {
    const reg = /[^<>&|~`/@$\{\}\[\]]/gim;
    const result = str.match(reg);
    return result ? result.join('') : '';
  }
  return '';
}

class ValueObject {
  public inputValue: string;
  public memoValue: string;
  public radioBox: Array<boolean>;
  constructor(input: Input, radio?: Array<Radio>, memo?: MemoBox) {
    this.inputValue = input.value ? input.value : '';
    this.memoValue = ValueObject._getMemoValue(memo);
    this.radioBox = ValueObject._toBooleanArr(radio);
  }
  static _toBooleanArr(radio: Radio[] | undefined): Array<boolean> {
    if (radio && radio.length > 0) {
      return radio.map((r: Radio) => r.defaultChecked);
    }
    return [];
  }
  static _getMemoValue(memo: MemoBox | undefined) {
    if (memo) {
      return memo.value ? memo.value : '';
    }
    return '';
  }
}

export interface Values {
  inputValue: string;
  memoValue: string;
  radioBox: Array<boolean> | [];
}

function ModalForm<FC>(props: ModalProps) {
  const { inputData, children } = props;

  const [value, setValue] = useState(
    new ValueObject(inputData.inputBox, inputData.radioBox, inputData.memoBox)
  );
  const [error, setError] = useState<ErrorObject | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const memoRef = useRef<HTMLTextAreaElement | null>(null);
  const radioRef = useRef<HTMLDivElement | null>(null);

  const inputChange = (e: React.ChangeEvent, typeid: string, idx?: number) => {
    const item = e.target as HTMLInputElement;
    const newValue = { ...value };
    const memo = inputData.memoBox ? inputData.memoBox.name : 'empty0';
    const radio =
      inputData.radioBox && idx !== undefined
        ? inputData.radioBox[idx].name
        : 'empty1';
    switch (item.name) {
      case inputData.inputBox.name:
        newValue.inputValue = toCharString(item.value);
        break;
      case radio:
        if (idx !== undefined) {
          newValue.radioBox.fill(false);
          newValue.radioBox[idx] = item.checked;
          if (radioRef.current) radioRef.current.classList.remove('error');
        }
        break;
      case memo:
        newValue.memoValue = toCharString(item.value);
        break;
    }
    setValue(newValue);
    setError(null);
  };

  const onFocus: (e: React.FocusEvent) => void = (e: React.FocusEvent) => {
    e.target.classList.remove('error');
  };
  const onSubmit = () => {
    const errObject: ErrorObject = {};
    const memoMaxlen: number = inputData.memoBox ? inputData.memoBox.maxlen : 0;
    const inputMaxlen: number = inputData.inputBox.maxlen;
    const isInputRequired: boolean = inputData.inputBox.isRequired || false;

    // console.log(inputData.memoBox)
    if (!validateData(value.inputValue, inputMaxlen, isInputRequired)) {
      errObject.input = inputData.inputBox.isRequired
        ? getObjectError(value.inputValue, inputMaxlen)
        : undefined;
    } else if (
      inputData.memoBox &&
      !validateData(value.memoValue, memoMaxlen, inputData.memoBox.isRequired)
    ) {
      errObject.memo = getObjectError(value.memoValue, memoMaxlen);
      // errObject.memo = inputData.memoBox.isRequired
      //   ? getObjectError(value.memoValue, memoMaxlen)
      //   : undefined;
    } else if (inputData.radioBox && !validateRadioBox(value.radioBox)) {
      errObject.radio = getRadioObjectError(inputData.radioBox);
    }
    // console.log(errObject);
    if (errObject.input || errObject.memo || errObject.radio) {
      if (errObject.input && inputRef.current) {
        inputRef.current.classList.add('error');
      }
      if (errObject.memo && memoRef.current) {
        memoRef.current.classList.add('error');
      }
      if (errObject.radio && radioRef.current) {
        radioRef.current.classList.add('error');
      }
      setError(errObject);
    } else {
      setError(null);
      inputData.onOK(trimValues(value));
      setValue(resetValues(value, inputData));
    }
  };

  const onCancel = () => {
    setError(null);
    setValue(resetValues(value, inputData));
    inputData.onCancel();
  };

  const keyClick = (e: React.KeyboardEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement;
    if (e.keyCode === 13 && target.name === inputData.inputBox.name) {
      if (memoRef.current) memoRef.current.focus();
      else onSubmit();
    }
  };
  const onEscPress = (e: React.KeyboardEvent<HTMLElement>) => {
    // console.log('Esc press...');
    if (e.keyCode === 27) onCancel();
  };

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  return (
    <>
      <div className="modal">
        <div
          className="modal-background"
          onKeyDown={(e) => onEscPress(e)}
          tabIndex={-1}
        ></div>
        <section
          className="modal-input-group"
          onKeyDown={(e) => onEscPress(e)}
          tabIndex={-1}
        >
          <h3>{inputData.formTitle}</h3>
          <div className="modal-input">
            <label>
              {inputData.inputBox.label}
              <input
                ref={inputRef}
                name={inputData.inputBox.name}
                onChange={(e) => inputChange(e, 'input')}
                value={value.inputValue}
                onFocus={(e) => onFocus(e)}
                placeholder={inputData.inputBox.placeholder}
                onKeyDown={(e) => keyClick(e)}
              />
            </label>
          </div>
          {!!inputData.radioBox && (
            <div className="radio-group" ref={radioRef}>
              <p className="radio-label">{inputData.radioLabel}</p>
              {inputData.radioBox.map((radio: Radio, idx: number) => (
                <div key={radio.name} className="label">
                  <label>
                    <input
                      type="radio"
                      className="modal-radio"
                      onChange={(e) => inputChange(e, 'radio', idx)}
                      checked={value.radioBox[idx]}
                      name={radio.name}
                    />
                    {radio.name}
                  </label>
                </div>
              ))}
            </div>
          )}
          {!!inputData.memoBox && (
            <div className="modal-memo">
              <label>
                {inputData.memoBox.label}
                <textarea
                  ref={memoRef}
                  name={inputData.memoBox.name}
                  onChange={(e) => inputChange(e, 'memo')}
                  onFocus={(e) => onFocus(e)}
                  placeholder={inputData.memoBox.placeholder}
                  value={value.memoValue}
                  rows={5}
                  cols={45}
                ></textarea>
              </label>
            </div>
          )}
          {children(error)}
          <div className="modal-input-footer">
            <button type="button" onClick={onCancel} name="cancel">
              Cancel
            </button>
            <button type="button" onClick={onSubmit} name="submit">
              OK
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default ModalForm;
