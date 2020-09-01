/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import * as React from 'react';
import type {NativeOrDynamicColorType} from '../../StyleSheet/NativeOrDynamicColorType'; // TODO(macOS ISS#2323203)

import type {
  WithDefault,
  BubblingEventHandler,
} from 'react-native/Libraries/Types/CodegenTypes';

import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {HostComponent} from 'react-native/Libraries/Renderer/shims/ReactNativeTypes';

import type {ColorValue} from '../../StyleSheet/StyleSheetTypes';
import type {ViewProps} from '../View/ViewPropTypes';

type SwitchChangeEvent = $ReadOnly<{|
  value: boolean,
|}>;

type NativeProps = $ReadOnly<{|
  ...ViewProps,

  // Props
  disabled?: WithDefault<boolean, false>,
  enabled?: WithDefault<boolean, true>,
  thumbColor?: ?(string | NativeOrDynamicColorType), // TODO(macOS ISS#2323203)
  trackColorForFalse?: ?(string | NativeOrDynamicColorType), // TODO(macOS ISS#2323203)
  trackColorForTrue?: ?(string | NativeOrDynamicColorType), // TODO(macOS ISS#2323203)
  value?: WithDefault<boolean, false>,
  on?: WithDefault<boolean, false>,
  thumbTintColor?: ?(string | NativeOrDynamicColorType), // TODO(macOS ISS#2323203)
  trackTintColor?: ?(string | NativeOrDynamicColorType), // TODO(macOS ISS#2323203)

  // Events
  onChange?: BubblingEventHandler<SwitchChangeEvent>,
|}>;

type NativeType = HostComponent<NativeProps>;

interface NativeCommands {
  +setNativeValue: (
    viewRef: React.ElementRef<NativeType>,
    value: boolean,
  ) => void;
}

export const Commands: NativeCommands = codegenNativeCommands<NativeCommands>({
  supportedCommands: ['setNativeValue'],
});

export default (codegenNativeComponent<NativeProps>('AndroidSwitch', {
  interfaceOnly: true,
}): NativeType);
