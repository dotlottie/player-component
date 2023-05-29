/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Signal } from '@preact/signals-core';
import { signal } from '@preact/signals-core';

export class Store<T> {
  protected _state: Signal<T>;

  protected _prevState: T;

  public constructor(initialState: T) {
    this._prevState = initialState;
    this._state = signal(initialState);
  }

  public setState(state: T): void {
    this._prevState = this._state.value;
    this._state.value = state;
  }

  public subscribe(callback: (value: T, prevValue: T) => void): () => void {
    return this._state.subscribe((val) => callback(val, this._prevState));
  }
}
