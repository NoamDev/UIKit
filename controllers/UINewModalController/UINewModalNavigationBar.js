// @flow
/* eslint-disable no-use-before-define, class-methods-use-this */
import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import type { ViewStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';

import UIStyle from '../../helpers/UIStyle';
import UIColor from '../../helpers/UIColor';
import UILocalized from '../../helpers/UILocalized';
import UIConstant from '../../helpers/UIConstant';
import UIComponent from '../../components/UIComponent';


type Props = {
    rightComponent?: React$Node,
    leftComponent?: React$Node,
    centralComponent?: React$Node,
    bottomLine?: boolean,
    height: number,
    title: string,
    cancelImage: ?string,
    cancelText: string,
    swipeToDismiss: boolean,
    dismissStripeStyle: ViewStyleProp,
    onCancel: ?() => void,
};

type State = {};

export default class UINewModalNavigationBar extends UIComponent<Props, State> {
    static defaultProps = {
        title: '',
        bottomLine: false,
        cancelImage: null,
        cancelText: UILocalized.Cancel,
        swipeToDismiss: false,
        dismissStripeStyle: null,
        onCancel: null,
    };

    // Render
    renderContent() {
        const {
            onCancel, bottomLine, swipeToDismiss, dismissStripeStyle, cancelImage,
            cancelText, leftComponent, centralComponent, rightComponent,
        } = this.props;

        if (swipeToDismiss) {
            return (
                <View
                    style={[
                        UIStyle.Common.rowCenterSpaceContainer(),
                        UIStyle.Width.full(),
                        UIStyle.Padding.horizontal(),
                    ]}
                >
                    <View
                        style={[
                            UIStyle.Common.absoluteFillObject(),
                            UIStyle.Common.centerContainer(),
                        ]}
                    >
                        <View
                            testID="swipe_to_dismiss"
                            style={[UIStyle.Common.dismissStripe(), dismissStripeStyle]}
                        />
                    </View>
                    {leftComponent}
                    {rightComponent}
                </View>
            );
        }

        if (!onCancel) {
            return null;
        }

        const image = <Image style={styles.cancelImage} source={cancelImage} />;

        const text = (
            <Text style={UIStyle.Text.actionSmallMedium()}>
                {cancelText}
            </Text>
        );

        const separator = bottomLine ? styles.bottomLine : null;

        return (
            <View style={[UIStyle.Common.flex(), styles.defaultContainer, separator]}>
                <TouchableOpacity style={styles.navButton} onPress={onCancel}>
                    {cancelImage ? image : text}
                </TouchableOpacity>
                <View style={[UIStyle.Common.flex(), styles.headerCentral]}>
                    {centralComponent}
                </View>
                <View>
                    {rightComponent}
                </View>
            </View>
        );
    }

    render() {
        return (
            <View
                testID="NavigationBar-container"
                style={[
                    styles.navigationView,
                    { height: this.props.height },
                ]}
            >
                {this.renderContent()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    navigationView: {
        borderTopLeftRadius: UIConstant.borderRadius(),
        borderTopRightRadius: UIConstant.borderRadius(),
    },
    defaultContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelImage: {
        height: UIConstant.tinyButtonHeight(),
        width: UIConstant.tinyButtonHeight(),
    },
    bottomLine: {
        borderBottomWidth: 1,
        borderBottomColor: UIColor.light(),
    },
    headerCentral: {
        marginHorizontal: UIConstant.smallContentOffset(),
    },
});
