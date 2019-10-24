// @flow
/* eslint-disable no-use-before-define, class-methods-use-this */
import React from 'react';
import { View, Platform, Dimensions, Keyboard } from 'react-native';
import Modal, { BottomModal, SlideAnimation, FadeAnimation } from 'react-native-modals';

import type {
    ControllerProps,
    ControllerState,
} from '../UIController';

import UIController from '../UIController';
import UIDevice from '../../helpers/UIDevice';
import UINewModalNavigationBar from './UINewModalNavigationBar';
import UIStyle from '../../helpers/UIStyle';

type OnLayoutEventArgs = {
    nativeEvent: {
        layout: {
            x: number,
            y: number,
            width: number,
            height: number,
        },
    },
};

export type ModalControllerProps = ControllerProps & {
    dismissible?: boolean,
    animation?: FadeAnimation | SlideAnimation,
    size?: number,
    type?: Modal | BottomModal,
    isModal?: boolean,
    onWillAppear?: () => void,
    onDidAppear?: () => void,
    onWillHide?: () => void,
    onDidHide?: () => void,
};

export type ModalControllerState = ControllerState & {
    width?: ?number,
    height?: ?number,
    controllerVisible?: boolean,
    isVisible?: boolean,
    showContent?: boolean,
    showHeader?: boolean,
};

export type ModalControllerShowArgs = ?boolean | {
    open?: boolean,
    onCancel?: () => void,
    onSubmit?: () => void,
    onSelect?: (any) => void,
};

export const ModalAnimation = {
    get fade() {
        return new FadeAnimation({ toValue: 1 });
    },
    get slide() {
        return new SlideAnimation({ slideFrom: 'bottom' });
    },
};

export const ModalSize = {
    get half() {
        return 0.5;
    },
    get default() {
        return 1;
    },
    get fullscreen() {
        return Dimensions.get('window').height;
    },
};

export const ModalType = {
    default: Modal,
    bottom: BottomModal,
};

export default class UINewModalController<Props, State>
    extends UIController<ModalControllerProps & Props, ModalControllerState & State> {
    fullscreen: boolean = false;
    dismissible: boolean;
    modal: ?Modal;
    animation: SlideAnimation | FadeAnimation;
    hasSpinnerOverlay: boolean = true;
    testID: ?string = '[UIModalController]';

    static defaultProps = {
        animation: ModalAnimation.slide,
        size: ModalSize.default,
        type: ModalType.default,
        dismissible: true,
        isModal: true,
    };

    state: ModalControllerState & State = {
        isVisible: false,
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    };

    constructor(props: ModalControllerProps & Props) {
        super(props);
        this.state = {
            ...super.state,
            ...this.state,
        };
    }


    createRef = (modal: UIModalController<Props, State> | null) => {
        this.modal = modal;
    };

    /**
     * Events
     */

    onWillAppear() {
        if (this.props.onWillAppear) {
            this.props.onWillAppear();
        }
    }

    onDidAppear() {
        this.initKeyboardListeners();

        if (this.props.onDidAppear) {
            this.props.onDidAppear();
        }
    }

    onWillHide() {
        this.deinitKeyboardListeners();

        if (this.props.onWillHide) {
            this.props.onWillHide();
        }
    }

    onDidHide() {
        if (this.props.onDidHide) {
            this.props.onDidHide();
        }
    }

    onDidAppearHandler = () => {
        this.onDidAppear();
    };

    onDidHideHandler = () => {
        this.onDidHide();
    };

    onCancelPress = () => {
        this.hide();
        if (this.onCancel) {
            this.onCancel();
        }
    };

    onLayout = (e: OnLayoutEventArgs) => {
        const { layout } = e.nativeEvent;
        // const { width, height } = layout;

        console.info(layout);
        // this.setSize(width, height);
    };

    /**
     * Getters
     */

    // Override if needed!
    shouldSwipeToDismiss() {
        return Platform.OS !== 'web';
    }

    getNavigationBarHeight() {
        return this.shouldSwipeToDismiss() ? 30 : 48;
    }

    getDialogStyle() {
        let { height } = Dimensions.get('window');
        const { width } = Dimensions.get('window');

        const statusBarHeight = UIDevice.statusBarHeight();
        const navBarHeight = Platform.OS === 'web' || !this.props.dismissible
            ? 0
            : UIDevice.navigationBarHeight(); // navigation bar height above the modal controller

        height -= statusBarHeight + navBarHeight;

        let contentHeight = height - this.getSafeAreaInsets().bottom;

        if (this.props.dismissible) {
            contentHeight -= this.getNavigationBarHeight();
        }

        const isDesktop = UIDevice.isTablet() || UIDevice.isTabletWeb() || UIDevice.isDesktopWeb();

        return {
            width,
            height: !isDesktop ? height : undefined,
            contentHeight,
            containerStyle: {
                height,
                width,
            },
            dialogStyle: {
                ...isDesktop && UIStyle.flex1,
                ...isDesktop && this.props.type === BottomModal && {
                    height: height * 0.75,
                },
                ...isDesktop && this.props.type === Modal && {
                    maxHeight: height * 0.75,
                },
                ...isDesktop && {
                    maxWidth: 600,
                },
                ...this.props.type === BottomModal && {
                    paddingBottom: isDesktop ? 32 : 40,
                },
                ...this.props.size === ModalSize.full && {
                    height,
                    width,
                },
            },
        };
    }

    getCancelImage() {
        return null;
    }

    isHeaderLineVisible() {
        return false;
    }

    // Actions
    show() {
        this.onWillAppear();
        this.setStateSafely({ isVisible: true, showContent: true });
    }

    hide() {
        Keyboard.dismiss();
        this.onWillHide();
        this.setStateSafely({ isVisible: false, showContent: false });
    }

    // Render
    renderLeftHeader() {
        return null;
    }

    renderCentralHeader() {
        return null;
    }

    renderRightHeader() {
        return null;
    }

    renderModalNavigationBar() {
        if (!this.props.dismissible) {
            return null;
        }

        return (
            <UINewModalNavigationBar
                height={this.getNavigationBarHeight()}
                swipeToDismiss={this.shouldSwipeToDismiss()}
                leftComponent={this.renderLeftHeader()}
                centralComponent={this.renderCentralHeader()}
                rightComponent={this.renderRightHeader()}
                bottomLine={this.isHeaderLineVisible()}
                cancelImage={this.getCancelImage()}
                onCancel={this.onCancelPress}
            />
        );
    }

    // eslint-disable-next-line no-unused-vars
    renderContentView(contentHeight: number): React$Node {
        return null;
    }

    render() {
        const {
            width, height, contentHeight, containerStyle, dialogStyle,
        } = this.getDialogStyle();

        const testIDProp = this.testID ? { testID: `${this.testID}_dialog` } : null;

        const Component = !UIDevice.isMobile() ? this.props.type : BottomModal;

        return (
            <View onLayout={this.onLayout}>
                <Component
                    {...testIDProp}
                    ref={this.createRef}
                    width={width}
                    height={height}
                    swipeDirection={this.props.dismissible && 'down'} // can be string or an array
                    onSwiping={Keyboard.dismiss}
                    onSwipeOut={this.props.dismissible && this.onCancelPress}
                    containerStyle={containerStyle}
                    modalStyle={dialogStyle}
                    modalAnimation={this.props.animation} //
                    modalTitle={this.props.isModal && this.renderModalNavigationBar()
                    }
                    dismissOnTouchOutside={false}
                    onDismiss={this.onDidHideHandler}
                    onShown={this.onDidAppearHandler}
                    visible={this.state.isVisible}
                >
                    {this.state.showContent &&
                        this.renderContentView(contentHeight)
                    }
                </Component>
            </View>
        );
    }
}

