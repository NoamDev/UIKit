// @flow
import React from 'react';
import { View, StyleSheet } from 'react-native';

import UIComponent from '../../UIComponent';
import UIColor from '../../../helpers/UIColor';
import UIStyle from '../../../helpers/UIStyle';
import UIConstant from '../../../helpers/UIConstant';

type Props = {
    presetName: string,
    screenWidth: number,
};

type State = {};

export default class UIBackgroundView extends UIComponent<Props, State> {
    static PresetNames = {
        Secondary: 'Secondary',
        SecondaryImageTopRight: 'SecondaryImageTopRight',
        SecondaryImageBottomLeft: 'SecondaryImageBottomLeft',
        SecondaryImageTopLeft: 'SecondaryImageTopLeft',
        SecondaryImageCenterRight: 'SecondaryImageCenterRight',
        SecondaryImageBottomRight: 'SecondaryImageBottomRight',
        Primary: 'Primary',
    };

    static PresetStyles = StyleSheet.create({
        [UIBackgroundView.PresetNames.Secondary]: {
            backgroundColor: UIColor.fa(),
        },
        [UIBackgroundView.PresetNames.SecondaryImageTopRight]: {
            backgroundColor: UIColor.fa(),
            alignItems: 'flex-end',
        },
        [UIBackgroundView.PresetNames.SecondaryImageTopLeft]: {
            backgroundColor: UIColor.fa(),
        },
        [UIBackgroundView.PresetNames.SecondaryImageBottomLeft]: {
            backgroundColor: UIColor.fa(),
            justifyContent: 'flex-end',
        },
        [UIBackgroundView.PresetNames.SecondaryImageCenterRight]: {
            backgroundColor: UIColor.fa(),
            alignItems: 'flex-end',
            justifyContent: 'center',
        },
        [UIBackgroundView.PresetNames.SecondaryImageBottomRight]: {
            backgroundColor: UIColor.fa(),
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
        },
        [UIBackgroundView.PresetNames.Primary]: {
            backgroundColor: UIColor.backgroundPrimary(),
        },
    });

    static getPreset(presetName: string) {
        const {
            Secondary,
            SecondaryImageTopRight,
            SecondaryImageTopLeft,
            SecondaryImageBottomLeft,
            SecondaryImageCenterRight,
            SecondaryImageBottomRight,
            Primary,
        } = UIBackgroundView.PresetNames;
        const { PresetStyles } = UIBackgroundView;

        const presets = {
            [Secondary]: {
                backgroundStyle: PresetStyles[Secondary],
                image: null,
            },
            [SecondaryImageTopRight]: {
                backgroundStyle: PresetStyles[SecondaryImageTopRight],
                image: 'image',
            },
            [SecondaryImageTopLeft]: {
                backgroundStyle: PresetStyles[SecondaryImageTopLeft],
                image: 'image',
            },
            [SecondaryImageBottomLeft]: {
                backgroundStyle: PresetStyles[SecondaryImageBottomLeft],
                image: 'image',
            },
            [SecondaryImageCenterRight]: {
                backgroundStyle: PresetStyles[SecondaryImageCenterRight],
                image: 'image',
            },
            [SecondaryImageBottomRight]: {
                backgroundStyle: PresetStyles[SecondaryImageBottomRight],
                image: 'image',
            },
            [Primary]: {
                backgroundStyle: PresetStyles[Primary],
                image: null,
            },
        };

        return presets[presetName];
    }

    // Render
    render() {
        const { screenWidth, presetName } = this.props;
        const preset = UIBackgroundView.getPreset(presetName);
        if (!preset) {
            return null;
        }
        const { backgroundStyle, image } = preset;
        const imageView = image && screenWidth > UIConstant.elasticWidthBroad()
            ? <View style={UIStyle.backgroundImageContainer} />
            : null;
        return (
            <View style={[UIStyle.absoluteFillObject, backgroundStyle]}>
                {imageView}
            </View>
        );
    }

    static defaultProps: Props;
}

UIBackgroundView.defaultProps = {
    screenWidth: 0,
    presetName: '',
};
