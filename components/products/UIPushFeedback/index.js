// @flow
import React from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, Text } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import UIConstant from '../../../helpers/UIConstant';
import UIStyle from '../../../helpers/UIStyle';
import UIColor from '../../../helpers/UIColor';
import UIComponent from '../../UIComponent';
import UIGrid from '../../layout/UIGrid';
import UIGridColumn from '../../layout/UIGridColumn';

import UILocalized from '../../../helpers/UILocalized';

const styles = StyleSheet.create({
    fixHeight: {
        height: UIConstant.bigCellHeight(),
    },
});

type Props = {
    onPress: ()=>void,
    style?: ViewStyleProp,
}
type State = {
    gridColumns: number,
}

export default class UIPushFeedback extends UIComponent<Props, State> {
    grid: any;

    constructor(props: Props) {
        super(props);

        this.state = {
            gridColumns: 8,
        };
        this.grid = null;
    }

    // events
    onGridLayout = () => {
        if (this.grid) {
            this.setStateSafely({ gridColumns: this.grid.getColumns() });
        }
    }

    onRef = (ref: any) => {
        this.grid = ref;
    }

    isLarge() {
        return this.state.gridColumns === 8;
    }
    render() {
        const backColor = UIColor.primary1();
        const backColorStyle = UIColor.getBackgroundColorStyle(backColor);
        return (
            <UIGrid
                type={UIGrid.Type.C8}
                ref={this.onRef}
                onLayout={this.onGridLayout}
                style={backColorStyle}
            >
                <UIGridColumn medium={this.state.gridColumns}>
                    <TouchableWithoutFeedback onPress={this.props.onPress}>
                        <View style={[
                            styles.fixHeight,
                            UIStyle.Common.alignCenter(),
                            UIStyle.Common.justifyCenter(),
                            UIStyle.Width.full(),
                            this.props.style,
                        ]}
                        >
                            <Text style={[UIColor.actionTextPrimaryStyle(), UIStyle.Text.smallBold()]}>
                                {this.isLarge() ? UILocalized.PushFeedbackLong : UILocalized.PushFeedbackShort}
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>
                </UIGridColumn>
            </UIGrid>
        );
    }
}