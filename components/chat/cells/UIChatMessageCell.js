// @flow
import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
} from 'react-native';
import ParsedText from 'react-native-parsed-text';
import Moment from 'moment';

import type { TextStyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import type { LayoutEvent, Layout } from 'react-native/Libraries/Types/CoreEventTypes';

import UIPureComponent from '../../UIPureComponent';
import UIColor from '../../../helpers/UIColor';
import UIConstant from '../../../helpers/UIConstant';
import UIStyle from '../../../helpers/UIStyle';
import UIFont from '../../../helpers/UIFont';
import UILocalized from '../../../helpers/UILocalized';

import UIChatImageCell from './UIChatImageCell';
import UIChatDocumentCell from './UIChatDocumentCell';
import UIChatTransactionCell from './UIChatTransactionCell';

import { ChatMessageContent, ChatMessageStatus } from '../extras';

import type { ChatMessageContentType, ChatMessageStatusType, ChatAdditionalInfo } from '../extras';

type Props = {
    type?: ChatMessageContentType,
    status?: ChatMessageStatusType,
    data?: any,
    additionalInfo?: ChatAdditionalInfo,

    onTouchMedia?: (objectToReturn: any) => void,
    onOpenPDF?: (document: any) => void,
    onPressUrl?: (url: string) => void,
    onTouchTransaction?: (trx: any) => void,
}

type State = {
    layout: Layout,
}

const styles = StyleSheet.create({
    container: {
        width: '80%',
        flexDirection: 'row',
        marginVertical: UIConstant.tinyContentOffset() / 2,
        alignItems: 'flex-end',
    },
    emptyChatCell: {
        marginVertical: UIConstant.tinyContentOffset() / 2,
        flexDirection: 'row',
        alignItems: 'flex-end',
        alignSelf: 'flex-start',
    },
    msgContainer: {
        flexShrink: 1,
        flexDirection: 'column',
        borderRadius: UIConstant.borderRadius(),
        paddingHorizontal: UIConstant.horizontalContentOffset(),
        paddingVertical: UIConstant.verticalContentOffset(),
    },
    wrapMsgContainer: {
        flexDirection: 'row',
        flexShrink: 1,
        alignItems: 'flex-end',
    },
    msgContainerInformation: {
        padding: 5,
        width: '100%',
        borderRadius: UIConstant.borderRadius(),
        backgroundColor: UIColor.warning(),
        justifyContent: 'center',
        alignItems: 'center',
    },
    msgContainerEmpty: {
        alignSelf: 'flex-start',
        borderRadius: UIConstant.borderRadius(),
        borderColor: UIColor.light(),
        borderWidth: 1,
        backgroundColor: UIColor.white(),
        paddingHorizontal: UIConstant.horizontalContentOffset(),
        paddingVertical: UIConstant.verticalContentOffset(),
        marginBottom: UIConstant.contentOffset(),
    },
    textCell: {
        textAlign: 'left',
        maxWidth: '100%',
    },
    msgSending: {
        alignItems: 'flex-end',
        backgroundColor: UIColor.backgroundQuinary(),
    },
    msgReceived: {
        alignItems: 'flex-start',
        backgroundColor: UIColor.fa(),
    },
    msgSent: {
        alignItems: 'flex-end',
        backgroundColor: UIColor.primary(),
    },
    urlReceived: {
        color: UIColor.primary(),
        textDecorationLine: 'underline',
    },
    urlSent: {
        color: UIColor.fa(),
        textDecorationLine: 'underline',
    },
    dateSeparator: {
        flexShrink: 1,
        flexDirection: 'column',
        margin: UIConstant.contentOffset() - (UIConstant.tinyContentOffset() / 2),
        justifyContent: 'center',
        backgroundColor: UIColor.overlay40(),
        height: UIConstant.smallCellHeight(),
        paddingHorizontal: UIConstant.smallContentOffset(),
        borderRadius: UIConstant.smallCellHeight() / 2,
    },
    dateText: {
        color: UIColor.secondary(),
    },
    timeTextLeft: {
        textAlign: 'left',
        marginTop: UIConstant.verticalContentOffset() / 2,
        color: UIColor.textQuaternary(),
    },
    timeTextRight: {
        textAlign: 'right',
        marginTop: UIConstant.verticalContentOffset() / 2,
        color: UIColor.textQuaternary(),
    },
    leftConner: {
        borderBottomLeftRadius: 0,
    },
    rightConner: {
        borderBottomRightRadius: 0,
    },
});

export default class UIChatMessageCell extends UIPureComponent<Props, State> {
    static defaultProps = {
        type: ChatMessageContent.EmptyChat,
        status: ChatMessageStatus.Received,
        data: null,
        additionalInfo: { message: null, lastFromChain: true },

        onTouchMedia: () => {},
        onOpenPDF: () => {},
        onTouchTransaction: () => {},
    };

    // constructor
    constructor(props: Props) {
        super(props);

        this.state = {
            layout: {
                width: 0,
                height: 0,
                x: 0,
                y: 0,
            },
        };
    }

    onLayout(e: LayoutEvent) {
        const { layout } = e.nativeEvent;
        this.setStateSafely({ layout });
    }

    onPressUrl(url: string, matchIndex: number) {
        const { onPressUrl } = this.props;
        if (onPressUrl) {
            onPressUrl(url);
        }
    }

    onTransactionPress = () => {
        const { additionalInfo, onTouchTransaction } = this.props;
        const message = additionalInfo?.message;
        if (message && onTouchTransaction) {
            onTouchTransaction(message?.info.trx);
        }
    }

    getLayout(): Layout {
        return this.state.layout;
    }

    getTextAlign(): { textAlign: string } {
        return this.isReceived() ? { textAlign: 'left' } : { textAlign: 'right' };
    }

    getFontColor(): TextStyleProp {
        return this.isReceived()
            ? UIStyle.Color.getColorStyle(UIColor.textSecondary(UIColor.Theme.Light))
            : UIStyle.Color.getColorStyle(UIColor.textSecondary(UIColor.Theme.Dark));
    }

    getStatus(): string {
        const { status } = this.props;
        return status || ChatMessageStatus.Received;
    }

    isReceived(): boolean {
        return this.getStatus() === ChatMessageStatus.Received;
    }

    formatedTime(date: ?Date): string {
        const msg = this.props.additionalInfo?.message;
        const time = date || new Date(msg?.info.created || 0);
        return Moment(time).format('LT');
    }

    wrapInMessageContainer(children: React$Element<*>, isSticker: boolean = false)
        : React$Element<*> {
        const { additionalInfo } = this.props;

        const bg = isSticker ? { backgroundColor: 'transparent' } : null;
        const userName = isSticker ? null : this.renderName();

        let rounded = {};

        if (additionalInfo?.lastFromChain) {
            rounded = this.isReceived()
                ? styles.leftConner
                : styles.rightConner;
        }

        let style = styles.msgSending;
        if (this.getStatus() === ChatMessageStatus.Received) {
            style = styles.msgReceived;
        } else if (this.getStatus() === ChatMessageStatus.Sent) {
            style = styles.msgSent;
        } else if (this.getStatus() === ChatMessageStatus.Sending) {
            style = styles.msgSending;
        }

        return (
            <View style={styles.wrapMsgContainer}>
                {this.renderAvatar()}
                <View
                    style={[
                        styles.msgContainer,
                        style,
                        rounded,
                        bg,
                    ]}
                >
                    {userName}
                    {children}
                    {this.renderTime()}
                </View>
            </View>
        );
    }

    wrapInTouch(wrap: React$Element<*>, objectToReturn: any): React$Element<*> {
        return (
            <TouchableHighlight
                style={UIStyle.Common.flex()}
                onPress={() => {
                    if (this.props.onTouchMedia) {
                        this.props.onTouchMedia(objectToReturn);
                    }
                }}
                key={`touchWrap_${wrap.key || ''}`}
            >
                <View>
                    {wrap}
                </View>
            </TouchableHighlight>
        );
    }

    renderAvatar() {
        return null; // TODO:
    }

    renderName() {
        return null; // TODO:
    }

    renderTime() {
        const textStyle = this.isReceived() ? styles.timeTextLeft : styles.timeTextRight;
        const msgTime = this.formatedTime();
        return (
            <Text style={[UIFont.tinyRegular(), textStyle]}>
                {msgTime}
            </Text>
        );
    }

    renderDateSeparator() {
        const { data } = this.props;
        return (
            <View style={styles.dateSeparator}>
                <Text style={[UIFont.tinyRegular(), styles.dateText]}>
                    {data}
                </Text>
            </View>
        );
    }

    renderImageCell() {
        const { data, additionalInfo } = this.props;
        if (!data) {
            return null;
        }

        return (
            this.wrapInMessageContainer(<UIChatImageCell
                image={data}
                parentLayout={this.getLayout()}
                additionalInfo={additionalInfo}
            />)
        );
    }

    renderDocumentCell() {
        const { data, onOpenPDF } = this.props;

        if (!data) {
            return null;
        }

        return (
            this.wrapInMessageContainer(<UIChatDocumentCell
                document={data}
                isReceived={this.isReceived()}
                onOpenPDF={(msg) => {
                    if (onOpenPDF) {
                        onOpenPDF(msg);
                    }
                }}
            />)
        );
    }

    renderInformationCell(text: string) {
        return (
            <View style={[styles.msgContainerInformation]}>
                <Text style={[
                    UIStyle.Color.getColorStyle(UIColor.white()),
                    UIFont.menuRegular(),
                ]}
                >
                    [{this.formatedTime()}] {text}
                </Text>
            </View>
        );
    }

    renderEmptyChatCell() {
        return (
            <View style={[styles.container, styles.emptyChatCell]}>
                <View style={styles.msgContainerEmpty}>
                    <Text style={[
                        UIFont.bodyMedium(),
                        UIStyle.Color.getColorStyle(UIColor.textPrimary()),
                    ]}
                    >
                        {UILocalized.SayHello}
                    </Text>
                </View>
            </View>
        );
    }

    renderTransactionCell() {
        const { additionalInfo } = this.props;
        return (
            <UIChatTransactionCell
                message={additionalInfo?.message}
                extraTrxInfo={additionalInfo?.transactionLocalized}
                onPress={this.onTransactionPress}
            />
        );
    }

    renderTextCell() {
        const { data } = this.props;
        return this.wrapInMessageContainer(this.renderText(data || ''));
    }

    renderText(text: string) {
        const urlStyle = this.getStatus() === ChatMessageStatus.Received ? styles.urlReceived : styles.urlSent;
        return (
            <ParsedText
                style={[this.getFontColor(), UIFont.smallRegular(), styles.textCell]}
                parse={[{ type: 'url', style: urlStyle, onPress: this.onPressUrl }]}
                key={`text${Math.trunc(Math.random() * 10000).toString()}`}
            >
                {text}
            </ParsedText>
        );
    }

    render() {
        const {
            type, status, additionalInfo,
        } = this.props;

        let cell = null;
        const extraSpace = additionalInfo?.lastFromChain ? { marginBottom: UIConstant.tinyContentOffset() } : null;

        let align = status === ChatMessageStatus.Received ? 'flex-start' : 'flex-end';
        if (type === ChatMessageContent.DateSeparator) {
            align = 'center';
            cell = this.renderDateSeparator();
        } else if (type === ChatMessageContent.EmptyChat) {
            align = 'flex-start';
            cell = this.renderEmptyChatCell();
        } else if (type === ChatMessageContent.TransactionInChat) {
            cell = this.renderTransactionCell();
        } else if (type === ChatMessageContent.SimpleText) {
            cell = this.renderTextCell();
        } else if (type === ChatMessageContent.AttachmentImage) {
            cell = this.renderImageCell();
        } else if (type === ChatMessageContent.AttachmentDocument) {
            cell = this.renderDocumentCell();
        } else {
            cell = this.renderInformationCell('Message/Cell type not supported.');
        }

        return (
            <View
                style={[
                    styles.container, {
                        alignSelf: align,
                        justifyContent: align,
                    },
                    extraSpace,
                ]}
                onLayout={e => this.onLayout(e)}
            >
                {cell}
            </View>
        );
    }
}