/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

'use strict';

const RNTesterActions = require('../utils/RNTesterActions');
const RNTesterExampleFilter = require('./RNTesterExampleFilter');
const React = require('react');

const {
  Platform,
  SectionList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} = require('react-native');

import type {ViewStyleProp} from '../../../Libraries/StyleSheet/StyleSheet';
import type {RNTesterExample} from '../types/RNTesterTypes';

import {RNTesterThemeContext} from './RNTesterTheme';

type Props = {
  onNavigate: Function,
  list: {
    ComponentExamples: Array<RNTesterExample>,
    APIExamples: Array<RNTesterExample>,
    ...
  },
  style?: ?ViewStyleProp,
  ...
};

class RowComponent extends React.PureComponent<{
  item: Object,
  isSelected?: ?boolean, // TODO(macOS ISS#2323203)
  onNavigate: Function,
  onPress?: Function,
  onShowUnderlay?: Function,
  onHideUnderlay?: Function,
  ...
}> {
  _onPress = () => {
    if (this.props.onPress) {
      this.props.onPress();
      return;
    }
    this.props.onNavigate(RNTesterActions.ExampleAction(this.props.item.key));
  };
  render() {
    const {item} = this.props;
    return (
      <RNTesterThemeContext.Consumer>
        {theme => {
          const rowStyle = this.props.isSelected
            ? styles.selectedRow
            : styles.row; // TODO(macOS ISS#2323203)
          return (
            <TouchableHighlight
              onShowUnderlay={this.props.onShowUnderlay}
              onHideUnderlay={this.props.onHideUnderlay}
              onAccessibilityAction={this._onPress} // TODO(macOS ISS#2323203)
              acceptsKeyboardFocus={false} // TODO(macOS ISS#2323203)
              onPress={this._onPress}>
              <View
                style={[
                  rowStyle, // TODO(macOS ISS#2323203)
                  {backgroundColor: theme.SystemBackgroundColor},
                ]}>
                <Text style={[styles.rowTitleText, {color: theme.LabelColor}]}>
                  {item.module.title}
                </Text>
                <Text
                  style={[
                    styles.rowDetailText,
                    {color: theme.SecondaryLabelColor},
                  ]}>
                  {item.module.description}
                </Text>
              </View>
            </TouchableHighlight>
          );
        }}
      </RNTesterThemeContext.Consumer>
    );
  }
}

const renderSectionHeader = ({section}) => (
  <RNTesterThemeContext.Consumer>
    {theme => {
      return (
        <Text
          style={[
            styles.sectionHeader,
            {
              color: theme.SecondaryLabelColor,
              backgroundColor: theme.GroupedBackgroundColor,
            },
          ]}>
          {section.title}
        </Text>
      );
    }}
  </RNTesterThemeContext.Consumer>
);

class RNTesterExampleList extends React.Component<Props, $FlowFixMeState> {
  render(): React.Node {
    const filter = ({example, filterRegex}) =>
      filterRegex.test(example.module.title) &&
      (!Platform.isTV || example.supportsTVOS);

    const sections = [
      {
        data: this.props.list.ComponentExamples,
        title: 'COMPONENTS',
        key: 'c',
      },
      {
        data: this.props.list.APIExamples,
        title: 'APIS',
        key: 'a',
      },
    ];

    return (
      <RNTesterThemeContext.Consumer>
        {theme => {
          return (
            <View
              style={[
                styles.listContainer,
                this.props.style,
                {backgroundColor: theme.SecondaryGroupedBackgroundColor},
              ]}>
              {this._renderTitleRow()}
              <RNTesterExampleFilter
                testID="explorer_search"
                sections={sections}
                filter={filter}
                render={({filteredSections}) => (
                  <SectionList
                    ItemSeparatorComponent={ItemSeparator}
                    contentContainerStyle={{
                      backgroundColor: theme.SeparatorColor,
                    }}
                    style={{backgroundColor: theme.SystemBackgroundColor}}
                    sections={filteredSections}
                    renderItem={this._renderItem}
                    keyboardShouldPersistTaps="handled"
                    acceptsKeyboardFocus={true} // TODO(macOS ISS#2323203)
                    onSelectionEntered={this._handleOnSelectionEntered} // TODO(macOS ISS#2323203)
                    enableSelectionOnKeyPress={true} // TODO(macOS ISS#2323203)
                    automaticallyAdjustContentInsets={false}
                    keyboardDismissMode="on-drag"
                    renderSectionHeader={renderSectionHeader}
                    // TODO 62 backgroundColor={Platform.select({
                    //  macos: 'transparent',
                    //  ios: 'transparent',
                    //  default: undefined,
                    // })} // TODO(macOS ISS#2323203)
                  />
                )}
              />
            </View>
          );
        }}
      </RNTesterThemeContext.Consumer>
    );
  }

  // [TODO(macOS ISS#2323203)
  _handleOnSelectionEntered = (item: any) => {
    const {key} = item;
    this.props.onNavigate(RNTesterActions.ExampleAction(key));
  };
  // ]TODO(macOS ISS#2323203)

  _renderItem = (
    {item, isSelected, separators}, // TODO(macOS ISS#2323203)
  ) => (
    <RowComponent
      item={item}
      isSelected={isSelected} // TODO(macOS ISS#2323203)
      onNavigate={this.props.onNavigate}
      onShowUnderlay={separators.highlight}
      onHideUnderlay={separators.unhighlight}
    />
  );

  _renderTitleRow(): ?React.Element<any> {
    /* $FlowFixMe(>=0.68.0 site=react_native_fb) This comment suppresses an
     * error found when Flow v0.68 was deployed. To see the error delete this
     * comment and run Flow. */
    if (!this.props.displayTitleRow) {
      return null;
    }
    return (
      <RowComponent
        item={{
          module: {
            title: 'RNTester',
            description: 'React Native Examples',
          },
        }}
        onNavigate={this.props.onNavigate}
        onPress={() => {
          this.props.onNavigate(RNTesterActions.ExampleList());
        }}
      />
    );
  }

  _handleRowPress(exampleKey: string): void {
    this.props.onNavigate(RNTesterActions.ExampleAction(exampleKey));
  }
}

const ItemSeparator = ({highlighted}) => (
  <RNTesterThemeContext.Consumer>
    {theme => {
      return (
        <View
          style={
            highlighted
              ? [
                  styles.separatorHighlighted,
                  {backgroundColor: theme.OpaqueSeparatorColor},
                ]
              : [styles.separator, {backgroundColor: theme.SeparatorColor}]
          }
        />
      );
    }}
  </RNTesterThemeContext.Consumer>
);

const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
  },
  list: {
    ...Platform.select({
      // [TODO(macOS ISS#2323203)
      macos: {
        backgroundColor: {semantic: 'controlBackgroundColor'},
      },
      ios: {
        backgroundColor: {semantic: 'systemBackgroundColor'},
      },
      default: {
        // ]TODO(macOS ISS#2323203)
        backgroundColor: '#eeeeee',
      }, // [TODO(macOS ISS#2323203)
    }), // ]TODO(macOS ISS#2323203)
  },
  sectionHeader: {
    ...Platform.select({
      // [TODO(macOS ISS#2323203)
      macos: {
        backgroundColor: {
          semantic: 'unemphasizedSelectedContentBackgroundColor',
        },
        color: {semantic: 'headerTextColor'},
      },
      ios: {
        backgroundColor: {
          semantic: 'systemGroupedBackgroundColor',
        },
        color: {semantic: 'secondaryLabelColor'},
      },
      default: {
        // ]TODO(macOS ISS#2323203)
        backgroundColor: '#eeeeee',
        color: 'black',
      }, // [TODO(macOS ISS#2323203)
    }), // ]TODO(macOS ISS#2323203)
    padding: 5,
    fontWeight: '500',
    fontSize: 11,
  },
  row: {
    ...Platform.select({
      // [TODO(macOS ISS#2323203)
      macos: {
        backgroundColor: {semantic: 'controlBackgroundColor'},
      },
      ios: {
        backgroundColor: {semantic: 'secondarySystemGroupedBackgroundColor'},
      },
      default: {
        // ]TODO(macOS ISS#2323203)
        backgroundColor: 'white',
      }, // [TODO(macOS ISS#2323203)
    }), // ]TODO(macOS ISS#2323203)
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  selectedRow: {
    // [TODO(macOS ISS#2323203)
    backgroundColor: '#DDECF8',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
  }, // ]TODO(macOS ISS#2323203)
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 15,
    ...Platform.select({
      // [TODO(macOS ISS#2323203)
      macos: {
        backgroundColor: {semantic: 'separatorColor'},
      },
      ios: {
        backgroundColor: {semantic: 'separatorColor'},
      },
      default: {
        // ]TODO(macOS ISS#2323203)
        backgroundColor: '#bbbbbb',
      }, // [TODO(macOS ISS#2323203)
    }), // ]TODO(macOS ISS#2323203)
  },
  separatorHighlighted: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgb(217, 217, 217)',
  },
  sectionListContentContainer: Platform.select({
    // [TODO(macOS ISS#2323203)
    macos: {backgroundColor: {semantic: 'separatorColor'}},
    ios: {backgroundColor: {semantic: 'separatorColor'}},
    default: {backgroundColor: 'white'},
  }), // ]TODO(macOS ISS#2323203)
  rowTitleText: {
    fontSize: 17,
    fontWeight: '500',
    ...Platform.select({
      // [TODO(macOS ISS#2323203)
      macos: {
        color: {semantic: 'controlTextColor'},
      },
      ios: {
        color: {semantic: 'labelColor'},
      },
      default: {
        // ]TODO(macOS ISS#2323203)
        color: 'black',
      }, // [TODO(macOS ISS#2323203)
    }), // ]TODO(macOS ISS#2323203)
  },
  rowDetailText: {
    fontSize: 15,
    lineHeight: 20,
  },
});

module.exports = RNTesterExampleList;
