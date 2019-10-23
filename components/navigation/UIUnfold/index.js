// @flow
import React from 'react';
import { TouchableOpacity, Image, Text, View } from 'react-native';

import StylePropType from 'react-style-proptype';
import UIStyle from '../../../helpers/UIStyle';
import UIConstant from '../../../helpers/UIConstant';
import UIComponent from '../../UIComponent';

const iconShowDefault = require('../../../assets/ico-unfold/ico-show.png');
const iconHideDefault = require('../../../assets/ico-unfold/ico-hide.png');

type Props = {
    /**
    Text to show content
    @default null
    */
    titleShow?: ?string,
    /**
    Text to hide content
    @default null
    */
    titleHide?: ?string,
    /**
    Icon to show content
    @default UIKit/assets/ico-unfold/ico-show.png
    */
    iconShow: string | number,
    /**
    Icon to hide content
    @default UIKit/assets/ico-unfold/ico-hide.png
    */
    iconHide: string | number,
    /**
    Position of fold/unfold icon to text, one of UIUnfold.Position.Right, UIUnfold.Position.Left
    @default UIUnfold.Position.Right
    */
    iconPosition?: ?string,
    /**
    Component to fold/unfold
    @default null
    */
    content?: ?any,
    /**
    Container style
    @default null
    */
    style?: ?StylePropType,
    /**
    Text style
    @default null
    */
    textStyle?: ?StylePropType,
    /**
    Whether it's unfolded
    @default false
    */
    unfolded: boolean,
    /**
    Use it prop to hide fold/unfold icon
    @default true
    */
    showButton: boolean,
    /**
    Size of button, one of UIUnfold.Size.M (40 height), UIUnfold.Size.L (48 height)
    @default UIUnfold.Size.M
    */
    size: string,
    /**
    Your handler here if need unfolded value outside, onPress(unfolded) {...}
    @default null
    */
    onPress?: ?(unfolded: boolean)=>void,
};

type State = {
    unfolded: boolean,
};

export default class UIUnfold extends UIComponent<Props, State> {
    static position = {
        right: 'right',
        left: 'left',
    };
    static size = {
        m: 'm',
        l: 'l',
    };

    // Deprecated
    static Position = {
        Right: 'right',
        Left: 'left',
    };
    static Size = {
        M: 'm',
        L: 'l',
    };

    static defaultProps: Props = {
        titleShow: null,
        titleHide: null,
        showButton: true,
        iconShow: iconShowDefault,
        iconHide: iconHideDefault,
        iconPosition: UIUnfold.position.right,
        content: null,
        style: null,
        textStyle: null,
        unfolded: false,
        size: UIUnfold.size.m,
    };

    constructor(props: Props) {
        super(props);
        this.state = {
            unfolded: props.unfolded,
        };
    }

    componentWillReceiveProps(nextProps: Props) {
        if (this.state.unfolded !== nextProps.unfolded) {
            this.setState({ unfolded: nextProps.unfolded });
        }
    }

    // Events
    onPress = () => {
        if (this.props.onPress) { this.props.onPress(!this.state.unfolded); }
        this.setState({ unfolded: !this.state.unfolded });
    };

    // Getters
    getHeight() {
        if (this.props.size === UIUnfold.Size.M) {
            return UIConstant.mediumButtonHeight();
        }
        // L
        return UIConstant.buttonHeight();
    }

    getTextStyle() {
        if (this.props.size === UIUnfold.Size.M) return [UIStyle.Text.primaryCaptionMedium()];
        // L
        return [UIStyle.Text.primarySmallMedium()];
    }

    // Render
    renderButton() {
        const {
            showButton, textStyle, iconHide, iconShow, titleHide, titleShow, iconPosition,
        } = this.props;
        const { unfolded } = this.state;
        const image = unfolded ? <Image source={iconHide} /> : <Image source={iconShow} />;
        const icon = showButton ? image : null;
        const isRight = iconPosition === UIUnfold.Position.Right;
        const iconLeft = isRight ? null : icon;
        const iconRight = isRight ? icon : null;
        const title = unfolded ? titleHide : titleShow;

        const containerStyle = [
            UIStyle.common.flex(),
            UIStyle.common.flexRow(),
            UIStyle.common.alignCenter(),
            UIStyle.margin.bottomDefault(),
        ];

        if (title && iconRight) {
            containerStyle.push(UIStyle.common.justifySpaceBetween());
        }

        if (!title && iconRight) {
            containerStyle.push(UIStyle.common.justifyEnd());
        }

        return (
            <TouchableOpacity style={containerStyle} onPress={this.onPress}>
                <View style={[
                    UIStyle.common.flex(),
                    UIStyle.common.flexRow(),
                    UIStyle.common.alignCenter(),
                    UIStyle.margin.rightSmall(),
                ]}
                >
                    {iconLeft}
                    <Text style={[
                        this.getTextStyle(),
                        iconLeft ? UIStyle.margin.leftSmall() : null,
                        textStyle,
                    ]}
                    >
                        {title}
                    </Text>
                </View>
                {iconRight}
            </TouchableOpacity>
        );
    }

    render() {
        const { style, content } = this.props;
        return (
            <View style={[UIStyle.margin.topDefault(), style]}>
                {this.renderButton()}
                {this.state.unfolded ? content : null}
            </View>
        );
    }
}
