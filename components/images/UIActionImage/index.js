// @flow
import React from 'react';
import { Image } from 'react-native';

import type { ActionProps, ActionState } from '../../UIActionComponent';
import UIActionComponent from '../../UIActionComponent';
import UIColor from '../../../helpers/UIColor';
import UIStyle from '../../../helpers/UIStyle';

type Props = ActionProps & {
    iconDisabled: string,
    iconEnabled: string,
    iconHovered: string,
};

type State = ActionState;

export default class UIActionImage extends UIActionComponent<Props, State> {
    renderColoredImage() {
        const {
            source, colorDisabled, colorHovered, colorEnabled, style, theme, onPress,
        } = this.props;

        let color;
        const disabled = this.props.disabled || !onPress;
        if (disabled && colorDisabled) {
            color = colorDisabled;
        } else if (this.isHover() && colorHovered) {
            color = colorHovered;
        } else if (colorEnabled) {
            color = colorEnabled;
        } else {
            color = UIColor.stateTextPrimary(theme, disabled, this.isTapped(), this.isHover());
        }
        const colorStyle = color ? UIStyle.Color.getTintColorStyle(color) : null;
        return (
            <Image
                source={source}
                style={[colorStyle, style]}
            />
        );
    }

    renderContent() {
        const {
            iconDisabled, iconHovered, iconEnabled, disabled, source, style,
        } = this.props;

        if (source) {
            return this.renderColoredImage();
        }

        let icon;
        if (disabled) {
            icon = iconDisabled || iconEnabled;
        } else if (this.isHover()) {
            icon = iconHovered || iconEnabled;
        } else {
            icon = iconEnabled;
        }
        return (
            <Image
                style={style}
                source={icon}
            />
        );
    }

    static defaultProps: Props;
}

UIActionImage.defaultProps = {
    ...UIActionComponent.defaultProps,
    theme: UIColor.Theme.Light,
    style: null,
    // first type of interface - multiple sources
    iconDisabled: null,
    iconEnabled: null,
    iconHovered: null,
    // second type of interface - one source and multiple colors
    source: null,
    colorDisabled: null,
    colorEnabled: null,
    colorHovered: null,
};