// @flow
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import StylePropType from 'react-style-proptype';

import UIConstant from '../../../helpers/UIConstant';
import UIComponent from '../../UIComponent';
import UIColor from '../../../helpers/UIColor';
import UIStyle from '../../../helpers/UIStyle';
import UITextStyle from '../../../helpers/UITextStyle';

const avatarSize = UIConstant.mediumAvatarSize();

const styles = StyleSheet.create({
    container: {
        height: UIConstant.largeCellHeight(),
    },
    avatar: {
        width: avatarSize,
        height: avatarSize,
        borderRadius: avatarSize / 2,
        backgroundColor: UIColor.primary(),
        marginRight: UIConstant.normalContentOffset(),
    },
});

type Props = {
    title: string,
    details: string,
    balance: string,
    containerStyle: ?StylePropType,
};

type State = {};

class UITokenCell extends UIComponent<Props, State> {
    static renderFractional(stringNumber: string) {
        if (!stringNumber) {
            return null;
        }
        const { primaryAccentRegular, secondaryAccentRegular } = UITextStyle;
        const [integer, fractional] = stringNumber.split('.');
        const decimals = (fractional && fractional.length > 0) ? fractional : '0';
        return (
            <Text style={primaryAccentRegular}>
                {integer}
                <Text style={secondaryAccentRegular}>
                    {`.${decimals}`}
                </Text>
            </Text>
        );
    }

    // constructor

    // Events

    // Setters

    // Getters

    // Processing

    // Actions

    // Render
    renderAvatar() {
        // Get avatar
        return (
            <View style={styles.avatar} />
        );
    }

    renderTitle() {
        return (
            <Text style={UITextStyle.primaryBodyRegular}>
                {this.props.title}
            </Text>
        );
    }

    renderDetails() {
        return (
            <Text style={[
                UITextStyle.secondaryCaptionRegular,
                UIStyle.marginTopTiny,
            ]}
            >
                {this.props.details}
            </Text>
        );
    }

    renderDefaultContent() {
        return (
            <React.Fragment>
                {this.renderAvatar()}
                <View style={[UIStyle.flex, UIStyle.marginRightDefault]}>
                    {this.renderTitle()}
                    {this.renderDetails()}
                </View>
                {UITokenCell.renderFractional(this.props.balance)}
            </React.Fragment>
        );
    }

    render() {
        return (
            <View style={[
                UIStyle.centerLeftContainer,
                styles.container,
                this.props.containerStyle,
            ]}
            >
                {this.renderDefaultContent()}
            </View>
        );
    }

    static defaultProps: Props;
}

export default UITokenCell;

UITokenCell.defaultProps = {
    title: '',
    details: '',
    balance: '0.00000000',
    containerStyle: null,
};