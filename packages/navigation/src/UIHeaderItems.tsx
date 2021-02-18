import * as React from 'react';
import { ImageProps, StyleSheet, TouchableOpacity } from 'react-native';

import { UIConstant } from '@tonlabs/uikit.core';
import {
    ColorVariants,
    UIImage,
    UILabel,
    UILabelColors,
    UILabelRoles,
} from '@tonlabs/uikit.hydrogen';

type OnPress = <T = void>() => T | Promise<T>;

export type HeaderItem = {
    /**
     * Label text for button
     */
    label: string;
    /**
     * Accessibility label for the button for screen readers.
     */
    accessibilityLabel?: string;
    /**
     * Icon source
     * Have default size: UIConstant.iconSize()
     */
    icon?: ImageProps;
    /**
     * Icon react node
     */
    iconElement?: JSX.Element;
    /**
     * Color variant for icon
     */
    iconTintColor?: ColorVariants;
    /**
     * Press handler
     */
    onPress?: OnPress;
};

function UIHeaderActionItem({ label, accessibilityLabel }: HeaderItem) {
    return (
        <UILabel
            role={UILabelRoles.Action}
            color={UILabelColors.TextAccent}
            accessibilityLabel={accessibilityLabel}
        >
            {label}
        </UILabel>
    );
}

function UIHeaderIconItem({
    icon,
    iconElement,
    iconTintColor,
}: HeaderItem): JSX.Element | null {
    if (iconElement) {
        return iconElement;
    }

    if (icon) {
        return (
            <UIImage
                {...icon}
                style={[styles.headerIcon, icon.style]}
                tintColor={iconTintColor}
            />
        );
    }

    return null;
}

function UIHeaderItemPressable({
    onPress,
    children,
    applyMargin,
}: {
    onPress?: OnPress;
    children: React.ReactNode;
    applyMargin: boolean;
}) {
    return (
        <TouchableOpacity
            hitSlop={{
                top: UIConstant.smallContentOffset(),
                bottom: UIConstant.smallContentOffset(),
                left: UIConstant.contentOffset(),
                right: UIConstant.contentOffset(),
            }}
            onPress={onPress}
            style={applyMargin ? styles.headerItemMargin : null}
        >
            {children}
        </TouchableOpacity>
    );
}

function UIHeaderItem({
    applyMargin,
    ...item
}: HeaderItem & { applyMargin: boolean }) {
    if (item.label != null) {
        return (
            <UIHeaderItemPressable
                onPress={item.onPress}
                applyMargin={applyMargin}
            >
                <UIHeaderActionItem {...item} />
            </UIHeaderItemPressable>
        );
    }
    if (item.icon != null || item.iconElement != null) {
        return (
            <UIHeaderItemPressable
                onPress={item.onPress}
                applyMargin={applyMargin}
            >
                <UIHeaderIconItem {...item} />
            </UIHeaderItemPressable>
        );
    }
    return null;
}

export function UIHeaderItems({ items = [] }: { items?: HeaderItem[] }) {
    return (
        <>
            {items.slice(0, 3).map((item, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <UIHeaderItem key={index} {...item} applyMargin={index > 0} />
            ))}
        </>
    );
}

const styles = StyleSheet.create({
    headerIcon: {
        width: UIConstant.iconSize(),
        height: UIConstant.iconSize(),
    },
    headerItemMargin: {
        marginLeft: 26,
    },
});